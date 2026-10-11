/**
 * POST /api/group - corporate and group scheme enquiry (brief section 8).
 *
 * Saves the enquiry to Vercel KV, WhatsApps the broker, and emails the corporate
 * desk, so the enquiry is in front of somebody within a minute of being sent.
 */
import { NextResponse } from "next/server";
import { groupEnquirySchema, fieldErrors } from "@/lib/schemas";
import { verifyCaptcha, captchaSummary } from "@/lib/captcha";
import { append, KEYS, storageWarning, backendName } from "@/lib/store";
import { makeReference } from "@/lib/reference";
import { brokerGroupMessage, notifyBroker, waLink } from "@/lib/whatsapp";
import { sendMail, plainLead, leadHtml } from "@/lib/mailer";
import { getClientIp, rateLimit, pruneBuckets, badRequest, json, fallbackWhatsApp } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  pruneBuckets();
  const ip = getClientIp(request);
  const limit = rateLimit(`group:${ip}`, 8, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "You have sent several enquiries from this connection. Please call +254 112 272 061 and we will help you directly.",
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

  const parsed = groupEnquirySchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest("Please check the highlighted fields and try again.", {
      fieldErrors: fieldErrors(parsed.error),
    });
  }

  const data = parsed.data;

  const captcha = await verifyCaptcha({
    token: data.captchaToken,
    expectedAction: "group_enquiry",
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
        error: "We could not verify this submission. Please try again, or call the corporate desk directly.",
        captcha: { ok: false, reason: captcha.reason, detail: captcha.detail },
        whatsappLink: fallbackWhatsApp(),
      },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const reference = makeReference("group");

  const record = {
    id: reference,
    reference,
    createdAt: new Date().toISOString(),
    kind: "group-enquiry" as const,
    companyName: data.companyName,
    industry: data.industry,
    contactName: data.contactName,
    email: data.email,
    phone: data.phone,
    employees: data.employees,
    coversNeeded: data.coversNeeded,
    currentScheme: data.currentScheme ?? "",
    notes: data.notes ?? "",
    captcha: captchaSummary(captcha),
    ip,
  };

  const { backend } = await append(KEYS.groupEnquiries, record);

  const message = brokerGroupMessage({
    reference,
    companyName: data.companyName,
    industry: data.industry,
    contactName: data.contactName,
    phone: data.phone,
    email: data.email,
    employees: data.employees,
    covers: data.coversNeeded,
    notes: data.notes,
  });

  const [whatsapp, mail] = await Promise.all([
    notifyBroker(message),
    sendMail({
      subject: `Group scheme enquiry ${reference} - ${data.companyName}`,
      text: plainLead({
        Reference: reference,
        Company: data.companyName,
        Industry: data.industry,
        Contact: data.contactName,
        Email: data.email,
        Phone: data.phone,
        Employees: data.employees,
        "Cover needed": data.coversNeeded.join(", "),
        "Current scheme": data.currentScheme ?? "",
        Notes: data.notes ?? "",
        Captcha: captchaSummary(captcha),
      }),
      html: leadHtml(`Group scheme enquiry ${reference}`, {
        Company: data.companyName,
        Industry: data.industry,
        Contact: data.contactName,
        Email: data.email,
        Phone: data.phone,
        Employees: data.employees,
        "Cover needed": data.coversNeeded.join(", "),
        "Current scheme": data.currentScheme ?? "",
        Notes: data.notes ?? "",
      }),
      replyTo: data.email,
    }),
  ]);

  const notes: string[] = [];
  const storageNote = storageWarning();
  if (storageNote) notes.push(storageNote);
  if (!whatsapp.delivered) notes.push(`Broker WhatsApp: ${whatsapp.reason}`);
  if (!mail.delivered) notes.push(`Email: ${mail.reason}`);

  console.info(`[api/group] ${reference} stored in ${backend}. WhatsApp delivered: ${whatsapp.delivered}.`);

  return json({
    ok: true,
    reference,
    message: `Thank you. Enquiry ${reference} has reached our corporate desk and a broker will call ${data.contactName} within one working day.`,
    delivery: {
      brokerWhatsApp: whatsapp.delivered ? "sent" : "not sent",
      email: mail.delivered ? "sent" : "not sent",
      storage: backendName(),
      notes,
    },
    whatsappLink: waLink(
      `Hello Barnabas Insurance Brokers. I sent group scheme enquiry ${reference} for ${data.companyName}.`,
    ),
  });
}

export async function GET() {
  return badRequest("Use POST to send a group scheme enquiry.");
}
