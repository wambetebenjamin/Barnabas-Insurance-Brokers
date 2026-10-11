/**
 * One time passcodes for the client portal.
 *
 * The portal signs a client in with their email address plus a policy reference
 * number, then emails a six digit code. Only a hash of the code is stored, it
 * expires after ten minutes, and five wrong attempts invalidate it, so a stolen
 * KV dump cannot be replayed into a session.
 */
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { KEYS, getJson, setJson } from "@/lib/store";
import { sendMail } from "@/lib/mailer";
import { SITE } from "@/lib/site";
import { serverEnv } from "@/lib/env";

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface OtpRecord {
  hash: string;
  createdAt: string;
  expiresAt: number;
  attempts: number;
}

const hash = (email: string, code: string): string =>
  createHash("sha256").update(`${email.toLowerCase()}:${code}:${process.env.AUTH_SECRET ?? "dev"}`).digest("hex");

export async function issueOtp(email: string): Promise<{ code: string; delivered: string }> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");

  const record: OtpRecord = {
    hash: hash(email, code),
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + TTL_MS,
    attempts: 0,
  };

  await setJson(KEYS.portalOtp(email), record);

  const mail = await sendMail({
    to: email,
    subject: `Your Barnabas Insurance portal code: ${code}`,
    text: [
      `Your one time code is ${code}.`,
      "",
      "It is valid for 10 minutes and can be used once. If you did not request it, you can ignore this email and nobody can access your policies.",
      "",
      `Barnabas Insurance Brokers, licensed by IRA Kenya. Licence No: ${SITE.iraLicenseNumber}.`,
    ].join("\n"),
    html: `<div style="font:15px Roboto,Arial,sans-serif;color:#15233C">
      <p>Your one time code is:</p>
      <p style="font:700 30px Poppins,Arial,sans-serif;letter-spacing:6px;color:#015FC9">${code}</p>
      <p style="color:#696E77">It is valid for 10 minutes and can be used once. If you did not request it, ignore this email and nobody can access your policies.</p>
      <p style="color:#696E77;font-size:12px">Barnabas Insurance Brokers, licensed by IRA Kenya. Licence No: ${SITE.iraLicenseNumber}.</p>
    </div>`,
  });

  return { code, delivered: mail.delivered ? "emailed" : `not emailed (${mail.reason})` };
}

export type OtpVerification =
  | { ok: true }
  | { ok: false; reason: "missing" | "expired" | "mismatch" | "too-many-attempts" };

export async function verifyOtp(email: string, code: string): Promise<OtpVerification> {
  const record = await getJson<OtpRecord>(KEYS.portalOtp(email));
  if (!record) return { ok: false, reason: "missing" };
  if (record.expiresAt < Date.now()) return { ok: false, reason: "expired" };
  if (record.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "too-many-attempts" };

  const candidate = Buffer.from(hash(email, code), "hex");
  const expected = Buffer.from(record.hash, "hex");

  if (candidate.length !== expected.length || !timingSafeEqual(candidate, expected)) {
    await setJson(KEYS.portalOtp(email), { ...record, attempts: record.attempts + 1 });
    return { ok: false, reason: "mismatch" };
  }

  // Single use: clear it as soon as it has been accepted.
  await setJson(KEYS.portalOtp(email), { ...record, expiresAt: 0, attempts: MAX_ATTEMPTS });
  return { ok: true };
}

/** In preview mode the code is surfaced so the portal can be reviewed without SMTP. */
export const demoHint = (): string | null =>
  serverEnv.portalDemoMode
    ? "PORTAL_DEMO_MODE is on, so the code is shown here instead of being emailed. Turn it off in production."
    : null;
