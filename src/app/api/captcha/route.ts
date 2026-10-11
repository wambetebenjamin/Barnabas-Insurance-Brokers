/**
 * POST /api/captcha - server-side reCAPTCHA verification (brief backend list).
 *
 * Every form route verifies its own token before it stores anything; this
 * endpoint exposes the same verification on its own, so a client can check a
 * token up front (for example to decide whether to show the v2 checkbox before
 * the visitor fills in a long form), and so the check can be exercised
 * independently during testing.
 *
 * The secret key never leaves the server, and the response never echoes it.
 */
import { z } from "zod";
import { verifyCaptcha, captchaConfigured } from "@/lib/captcha";
import { getClientIp, json, badRequest } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().max(4096).optional(),
  action: z.string().min(1).max(64),
  version: z.enum(["v3", "v2"]).default("v3"),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("The request body was not valid JSON.");
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return badRequest("Provide a token, an action name, and optionally the version.");
  }

  const result = await verifyCaptcha({
    token: parsed.data.token,
    expectedAction: parsed.data.action,
    version: parsed.data.version,
    remoteIp: getClientIp(request),
  });

  return json({
    ok: result.ok,
    configured: captchaConfigured(),
    version: result.version,
    score: result.score,
    action: result.action,
    skipped: result.skipped,
    reason: result.reason,
    detail: result.detail,
    // The client uses this to decide whether to render the v2 checkbox.
    needsV2: !result.ok && result.reason === "low-score",
  });
}

export async function GET() {
  return json({
    ok: true,
    configured: captchaConfigured(),
    note:
      "POST { token, action, version } to verify a token server side. Verification runs on every form route in addition to this endpoint.",
  });
}
