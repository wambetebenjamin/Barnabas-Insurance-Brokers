/**
 * POST /api/claim - claim notification (brief section 9).
 *
 * Stores the notification, notifies the broker team on WhatsApp and by email, and
 * records which documents were already uploaded to Vercel Blob so the claims team
 * knows whether to request paperwork.
 */
import { NextResponse } from "next/server";
import { claimNotificationSchema, fieldErrors } from "@/lib/schemas";
import { verifyCaptcha, captchaSummary } from "@/lib/captcha";
import { append, KEYS, storageWarning, backendName } from "@/lib/store";
import { makeReference } from "@/lib/reference";
import { brokerClaimMessage, notifyBroker, waLink } from "@/lib/whatsapp";
import { sendMail, plainLead, leadHtml } from "@/lib/mailer";
import { getClientIp, rateLimit, pruneBuckets, badRequest, json, fallbackWhatsApp } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  pruneBuckets();
  const ip = getClientIp(request);
  const limit = rateLimit(`claim:${ip}`, 12, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "You have sent several claim notifications from this connection. If this is urgent, please call our claims line on +254 112 272 061 now.",
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

  const parsed = claimNotificationSchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest("Please check the highlighted fields and try again.", {
      fieldErrors: fieldErrors(parsed.error),
    });
  }

  const data = parsed.data;

  const captcha = await verifyCaptcha({
    token: data.captchaToken,
    expectedAction: "claim_notification",
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
        error:
          "We could not verify this submission. Please try again, or call the claims line so we can take the details now.",
        captcha: { ok: false, reason: captcha.reason, detail: captcha.detail },
        whatsappLink: fallbackWhatsApp(),
      },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const reference = makeReference("claim");

  const record = {
    id: reference,
    reference,
    createdAt: new Date().toISOString(),
    kind: "claim" as const,
    policyNumber: data.policyNumber,
    insurer: data.insurer,
    claimantName: data.claimantName,
    phone: data.phone,
    email: data.email ?? "",
    incidentDate: data.incidentDate,
    incidentType: data.incidentType,
    description: data.description,
    estimatedValue: data.estimatedValue ?? null,
    documents: data.documents,
    documentCount: data.documents.length,
    captcha: captchaSummary(captcha),
    ip,
  };

  const { backend } = await append(KEYS.claims, record);

  const message = brokerClaimMessage({
    reference,
    policyNumber: data.policyNumber,
    insurer: data.insurer,
    claimant: data.claimantName,
    phone: data.phone,
    incidentDate: data.incidentDate,
    description: data.description,
    documents: data.documents.map((document) => document.name),
  });

  const [whatsapp, mail] = await Promise.all([
    notifyBroker(message),
    sendMail({
      subject: `Claim notification ${reference} - policy ${data.policyNumber}`,
      text: plainLead({
        Reference: reference,
        "Policy number": data.policyNumber,
        Insurer: data.insurer,
        Claimant: data.claimantName,
        Phone: data.phone,
        Email: data.email ?? "",
        "Incident date": data.incidentDate,
        "Incident type": data.incidentType,
        "Estimated value": data.estimatedValue ?? "",
        Description: data.description,
        Documents: data.documents.map((document) => document.name).join(", ") || "none uploaded",
        Captcha: captchaSummary(captcha),
      }),
      html: leadHtml(`Claim notification ${reference}`, {
        "Policy number": data.policyNumber,
        Insurer: data.insurer,
        Claimant: data.claimantName,
        Phone: data.phone,
        "Incident date": data.incidentDate,
        "Incident type": data.incidentType,
        Description: data.description,
        Documents: data.documents.map((document) => document.name).join(", ") || "none uploaded",
      }),
      replyTo: data.email,
    }),
  ]);

  const notes: string[] = [];
  const storageNote = storageWarning();
  if (storageNote) notes.push(storageNote);
  if (data.documents.length === 0) {
    notes.push(
      "No documents were uploaded. Our claims team will send the document checklist for this insurer.",
    );
  }
  if (!whatsapp.delivered) notes.push(`Broker WhatsApp: ${whatsapp.reason}`);
  if (!mail.delivered) notes.push(`Email: ${mail.reason}`);

  console.info(`[api/claim] ${reference} stored in ${backend}. WhatsApp delivered: ${whatsapp.delivered}.`);

  return json({
    ok: true,
    reference,
    message: `Claim ${reference} has been logged. Our claims team will contact you today with the document checklist.`,
    delivery: {
      brokerWhatsApp: whatsapp.delivered ? "sent" : "not sent",
      email: mail.delivered ? "sent" : "not sent",
      storage: backendName(),
      notes,
    },
    whatsappLink: waLink(
      `Hello Barnabas Insurance Brokers. I notified claim ${reference} for policy ${data.policyNumber}.`,
    ),
  });
}

export async function GET() {
  return badRequest("Use POST to notify a claim.");
}
