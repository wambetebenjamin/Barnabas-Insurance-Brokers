/**
 * POST /api/newsletter - newsletter signup (brief section 13).
 * Subscribers are stored in Vercel KV, reCAPTCHA v3 verified, and de-duplicated.
 */
import { NextResponse } from "next/server";
import { newsletterSchema, fieldErrors } from "@/lib/schemas";
import { verifyCaptcha, captchaSummary } from "@/lib/captcha";
import { append, list, KEYS, storageWarning, backendName } from "@/lib/store";
import { makeReference } from "@/lib/reference";
import { getClientIp, rateLimit, pruneBuckets, badRequest, json, fallbackWhatsApp } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  pruneBuckets();
  const ip = getClientIp(request);
  const limit = rateLimit(`newsletter:${ip}`, 10, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many signups from this connection. Please try again later.", whatsappLink: fallbackWhatsApp() },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds), "Cache-Control": "no-store" } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("The request body was not valid JSON.");
  }

  const parsed = newsletterSchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest("Please check the highlighted fields and try again.", {
      fieldErrors: fieldErrors(parsed.error),
    });
  }

  const data = parsed.data;

  const captcha = await verifyCaptcha({
    token: data.captchaToken,
    expectedAction: "newsletter_signup",
    version: data.captchaVersion ?? "v3",
    remoteIp: ip,
  });

  if (!captcha.ok) {
    if (captcha.reason === "low-score") {
      return json(
        {
          ok: false,
          error: "We need one extra step to confirm you are a person.",
          captcha: { ok: false, reason: captcha.reason, score: captcha.score, needsV2: true, detail: captcha.detail },
        },
        400,
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: "We could not verify this signup. Please refresh the page and try again.",
        captcha: { ok: false, reason: captcha.reason, detail: captcha.detail },
        whatsappLink: fallbackWhatsApp(),
      },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  // De-duplicate on email so a double tap does not add the client twice.
  const existing = await list(KEYS.subscribers, 500);
  const already = existing.find(
    (record) => String(record.email ?? "").toLowerCase() === data.email.toLowerCase(),
  );

  if (already) {
    return json({
      ok: true,
      reference: String(already.reference ?? ""),
      message: "You are already on the list. We will keep sending insurance tips and renewal reminders.",
    });
  }

  const reference = makeReference("newsletter");
  const record = {
    id: reference,
    reference,
    createdAt: new Date().toISOString(),
    kind: "newsletter" as const,
    email: data.email,
    name: data.name ?? "",
    interests: data.interests ?? [],
    source: data.source ?? "website",
    captcha: captchaSummary(captcha),
    ip,
  };

  const { backend } = await append(KEYS.subscribers, record);

  const notes: string[] = [];
  const storageNote = storageWarning();
  if (storageNote) notes.push(storageNote);

  console.info(`[api/newsletter] ${reference} stored in ${backend}.`);

  return json({
    ok: true,
    reference,
    message: "You are on the list. Insurance tips and renewal reminders for Kenya, once a month.",
    delivery: { storage: backendName(), notes },
  });
}

export async function GET() {
  return badRequest("Use POST to subscribe.");
}
