/**
 * reCAPTCHA, server side.
 *
 * The site uses reCAPTCHA v3 (invisible) on the quotation request form, the
 * group scheme enquiry, the claim notification form, the contact form, the
 * newsletter signup and the agent / client portal login. When the v3 score is
 * below RECAPTCHA_MIN_SCORE (0.5 by default) the client is asked to complete a
 * v2 checkbox and that token is verified here instead.
 *
 * Rules this file enforces:
 *   - The secret key is read from the environment only and never leaves the server.
 *   - The action name returned by Google must match the action the form claimed.
 *   - If no secret is configured the check is reported as `skipped`, never as a
 *     pass, so a misconfigured production deploy is visible in the lead record.
 *   - If Google cannot be reached, the default is to fail closed
 *     (RECAPTCHA_FAIL_OPEN=false). That can be reversed for an outage, and the
 *     lead record stores which decision was taken.
 */
import { capabilities, serverEnv } from "@/lib/env";

export interface CaptchaResult {
  ok: boolean;
  /** "v3" | "v2" | "none" */
  version: "v3" | "v2" | "none";
  score: number | null;
  action: string | null;
  /** True when no secret is configured and verification was not attempted. */
  skipped: boolean;
  /** Machine readable reason, stored on the lead for the broker team. */
  reason:
    | "verified"
    | "low-score"
    | "failed"
    | "action-mismatch"
    | "not-configured"
    | "verification-unreachable"
    | "missing-token"
    | "fail-open";
  detail?: string;
}

/** Google’s verify endpoint, with the alternate host as a fallback in China. */
const VERIFY_ENDPOINTS = [
  "https://www.google.com/recaptcha/api/siteverify",
  "https://www.recaptcha.net/recaptcha/api/siteverify",
];

async function siteverify(
  secret: string,
  token: string,
  remoteIp?: string,
): Promise<{ success: boolean; score?: number; action?: string; "error-codes"?: string[] } | null> {
  for (const endpoint of VERIFY_ENDPOINTS) {
    try {
      const body = new URLSearchParams({ secret, response: token });
      if (remoteIp) body.set("remoteip", remoteIp);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(6000),
        cache: "no-store",
      });

      if (!response.ok) continue;
      return (await response.json()) as {
        success: boolean;
        score?: number;
        action?: string;
        "error-codes"?: string[];
      };
    } catch {
      continue;
    }
  }
  return null;
}

export async function verifyCaptcha(input: {
  token?: string | null;
  /** The action the form registered with grecaptcha.execute. */
  expectedAction: string;
  /** "v3" for the invisible check, "v2" for the checkbox fallback. */
  version?: "v3" | "v2";
  remoteIp?: string;
}): Promise<CaptchaResult> {
  const version = input.version ?? "v3";
  const secret =
    version === "v2" ? serverEnv.recaptchaV2Secret || serverEnv.recaptchaSecret : serverEnv.recaptchaSecret;

  if (!secret) {
    return {
      ok: true,
      version: "none",
      score: null,
      action: null,
      skipped: true,
      reason: "not-configured",
      detail:
        version === "v2"
          ? "RECAPTCHA_V2_SECRET_KEY is not set."
          : "RECAPTCHA_SECRET_KEY is not set, so no verification was possible. This must be configured before launch.",
    };
  }

  if (!input.token) {
    return {
      ok: false,
      version,
      score: null,
      action: null,
      skipped: false,
      reason: "missing-token",
      detail: "The form did not supply a captcha token.",
    };
  }

  const result = await siteverify(secret, input.token, input.remoteIp);

  if (!result) {
    if (serverEnv.recaptchaFailOpen) {
      return {
        ok: true,
        version,
        score: null,
        action: null,
        skipped: false,
        reason: "fail-open",
        detail:
          "The verification endpoint could not be reached and RECAPTCHA_FAIL_OPEN is true, so the submission was accepted.",
      };
    }
    return {
      ok: false,
      version,
      score: null,
      action: null,
      skipped: false,
      reason: "verification-unreachable",
      detail:
        "The verification endpoint could not be reached and RECAPTCHA_FAIL_OPEN is false, so the submission was rejected. The lead has still been stored.",
    };
  }

  const score = typeof result.score === "number" ? result.score : null;

  if (!result.success) {
    return {
      ok: false,
      version,
      score,
      action: result.action ?? null,
      skipped: false,
      reason: "failed",
      detail: `Verification failed. Codes: ${(result["error-codes"] ?? []).join(", ") || "none supplied"}.`,
    };
  }

  // v3 returns the action the token was issued for. A mismatch means the token
  // was minted for a different form on the site and is rejected.
  if (version === "v3" && result.action && result.action !== input.expectedAction) {
    return {
      ok: false,
      version,
      score,
      action: result.action,
      skipped: false,
      reason: "action-mismatch",
      detail: `Token was issued for action "${result.action}" but this form expects "${input.expectedAction}".`,
    };
  }

  if (version === "v3" && score !== null && score < serverEnv.recaptchaMinScore) {
    return {
      ok: false,
      version,
      score,
      action: result.action ?? input.expectedAction,
      skipped: false,
      reason: "low-score",
      detail: `Score ${score} is below the minimum ${serverEnv.recaptchaMinScore}. The client is asked to complete the v2 checkbox.`,
    };
  }

  return {
    ok: true,
    version,
    score,
    action: result.action ?? input.expectedAction,
    skipped: false,
    reason: "verified",
    detail: score !== null ? `Score ${score}.` : undefined,
  };
}

/** Human readable summary stored on the lead record. */
export const captchaSummary = (result: CaptchaResult): string =>
  result.skipped
    ? `not verified (${result.reason})`
    : `${result.version} ${result.reason}${result.score !== null ? ` score=${result.score}` : ""}`;

export const captchaConfigured = (): boolean => capabilities.recaptcha;
