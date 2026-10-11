/**
 * POST /api/contact - general enquiry (brief section 14), delivered with Nodemailer.
 */
import { NextResponse } from "next/server";
import { contactSchema, fieldErrors } from "@/lib/schemas";
import { verifyCaptcha, captchaSummary } from "@/lib/captcha";
import { append, KEYS, storageWarning, backendName } from "@/lib/store";
import { makeReference } from "@/lib/reference";
import { brokerContactMessage, notifyBroker } from "@/lib/whatsapp";
import { sendMail, plainLead, leadHtml } from "@/lib/mailer";
import { getClientIp, rateLimit, pruneBuckets, badRequest, json, fallbackWhatsApp } from "@/lib/api";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  pruneBuckets();
  const ip = getClientIp(request);
  const limit = rateLimit(`contact:${ip}`, 10, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "You have sent several messages from this connection. Please call +254 112 272 061 and we will help you directly.",
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

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest("Please check the highlighted fields and try again.", {
      fieldErrors: fieldErrors(parsed.error),
    });
  }

  const data = parsed.data;

  const captcha = await verifyCaptcha({
    token: data.captchaToken,
    expectedAction: "contact_form",
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
        error: "We could not verify this message. Please try again, or call us and we will take your details.",
        captcha: { ok: false, reason: captcha.reason, detail: captcha.detail },
        whatsappLink: fallbackWhatsApp(),
      },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const reference = makeReference("newsletter").replace("BIB-N", "BIB-E"); // enquiry

  const record = {
    id: reference,
    reference,
    createdAt: new Date().toISOString(),
    kind: "contact" as const,
    name: data.name,
    email: data.email,
    phone: data.phone,
    subject: data.subject,
    message: data.message,
    captcha: captchaSummary(captcha),
    ip,
  };

  const { backend } = await append(KEYS.contacts, record);

  const [mail, whatsapp] = await Promise.all([
    sendMail({
      to: serverEnv.mailToBroker,
      subject: `Website enquiry ${reference} - ${data.subject}`,
      text: plainLead({
        Reference: reference,
        Name: data.name,
        Email: data.email,
        Phone: data.phone,
        Subject: data.subject,
        Message: data.message,
      }),
      html: leadHtml(`Website enquiry ${reference}`, {
        Name: data.name,
        Email: data.email,
        Phone: data.phone,
        Subject: data.subject,
        Message: data.message,
      }),
      replyTo: data.email,
    }),
    notifyBroker(
      brokerContactMessage({
        reference,
        name: data.name,
        phone: data.phone,
        email: data.email,
        subject: data.subject,
        message: data.message,
      }),
    ),
  ]);

  const notes: string[] = [];
  const storageNote = storageWarning();
  if (storageNote) notes.push(storageNote);
  if (!mail.delivered) notes.push(`Email: ${mail.reason}`);
  if (!whatsapp.delivered) notes.push(`Broker WhatsApp: ${whatsapp.reason}`);

  console.info(`[api/contact] ${reference} stored in ${backend}. Email delivered: ${mail.delivered}.`);

  return json({
    ok: true,
    reference,
    message: "Thank you, your message has reached our broker desk. We reply during working hours.",
    delivery: {
      email: mail.delivered ? "sent" : "not sent",
      brokerWhatsApp: whatsapp.delivered ? "sent" : "not sent",
      storage: backendName(),
      notes,
    },
  });
}

export async function GET() {
  return badRequest("Use POST to send an enquiry.");
}
