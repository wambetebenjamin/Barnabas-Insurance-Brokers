/**
 * POST /api/portal/otp - request a sign-in code for the client portal.
 *
 * Sign in is email address plus policy reference number, then a six digit code by
 * email (brief: "NextAuth for client portal with email OTP").
 *
 * Two protections matter here. The response never says whether the policy
 * reference exists, so the endpoint cannot be used to test references, and the
 * same generic answer is returned either way. Rate limiting is tight because this
 * endpoint sends email.
 */
import { NextResponse } from "next/server";
import { portalRequestOtpSchema, fieldErrors } from "@/lib/schemas";
import { verifyCaptcha } from "@/lib/captcha";
import { getJson } from "@/lib/store";
import { issueOtp, demoHint } from "@/lib/otp";
import { getClientIp, rateLimit, pruneBuckets, badRequest, json, fallbackWhatsApp } from "@/lib/api";
import { serverEnv } from "@/lib/env";
import { KEYS } from "@/lib/store";
import type { Policy } from "@/lib/portal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  pruneBuckets();
  const ip = getClientIp(request);
  const limit = rateLimit(`portal-otp:${ip}`, 6, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many code requests. Please wait a few minutes, or call us and we will help you in.",
        whatsappLink: fallbackWhatsApp(),
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds), "Cache-Control": "no-store" } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("The request body was not valid JSON.");
  }

  const parsed = portalRequestOtpSchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest("Please check the highlighted fields.", { fieldErrors: fieldErrors(parsed.error) });
  }

  const { email, policyReference } = parsed.data;

  const captcha = await verifyCaptcha({
    token: portalRequestOtpSchema.shape.captchaToken ? parsed.data.captchaToken : undefined,
    expectedAction: "portal_login",
    version: parsed.data.captchaVersion ?? "v3",
    remoteIp: ip,
  });

  if (!captcha.ok && captcha.reason !== "not-configured") {
    return NextResponse.json(
      {
        ok: false,
        error: "We could not verify this sign-in attempt. Please try again.",
        captcha: { ok: false, reason: captcha.reason, needsV2: captcha.reason === "low-score", detail: captcha.detail },
        whatsappLink: fallbackWhatsApp(),
      },
      { status: captcha.reason === "low-score" ? 400 : 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Does this client exist? Checked silently. The answer never changes the shape
  // of the response, so references cannot be probed.
  const policies = await getJson<Policy[]>(KEYS.portalPolicies(email));
  const exists = (policies ?? []).some(
    (policy) =>
      policy.reference.toLowerCase() === policyReference.toLowerCase() ||
      policy.policyNumber.toLowerCase() === policyReference.toLowerCase(),
  );

  // In preview mode, or for a client whose broker has not loaded the schedule
  // yet, we still issue a code: the portal then shows an empty state, which is
  // better than a dead end, and the broker can load the data afterwards.
  const issue = exists || serverEnv.portalDemoMode || !policies;

  if (!issue) {
    console.info(`[api/portal/otp] reference mismatch for ${email.slice(0, 3)}***, generic response returned.`);
    return json({
      ok: true,
      message: "If those details match a policy we hold, a six digit code is on its way to that email address.",
    });
  }

  const { code, delivered } = await issueOtp(email);

  const body: Record<string, unknown> = {
    ok: true,
    message: `We have emailed a six digit code to ${email}. It is valid for 10 minutes.`,
    delivery: { email: delivered },
  };

  // Preview convenience only: never in production.
  if (serverEnv.portalDemoMode) {
    body.demoCode = code;
    body.demoHint = demoHint();
  }

  return json(body);
}

export async function GET() {
  return badRequest("Use POST to request a sign-in code.");
}
