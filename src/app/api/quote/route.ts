/**
 * POST /api/quote - quotation request (brief section 6, backend).
 *
 * 1. validate the payload with the shared zod schema
 * 2. verify the reCAPTCHA v3 token server side (v2 fallback when the score is low)
 * 3. save the lead to Vercel KV with a reference number
 * 4. WhatsApp the broker the lead details
 * 5. WhatsApp the client a confirmation with their reference number
 * 6. email the broker as well, so a WhatsApp outage never loses a lead
 *
 * The response tells the client exactly what was delivered and what was not:
 * delivery status is never faked.
 */
import { NextResponse } from "next/server";
import { quoteRequestSchema, QUOTE_DETAIL_SCHEMAS, fieldErrors } from "@/lib/schemas";
import { verifyCaptcha, captchaSummary } from "@/lib/captcha";
import { append, KEYS, storageWarning, backendName } from "@/lib/store";
import { makeReference } from "@/lib/reference";
import { brokerQuoteMessage, clientConfirmationMessage, notifyBroker, confirmToClient, quoteRequestLink } from "@/lib/whatsapp";
import { sendMail, plainLead, leadHtml } from "@/lib/mailer";
import { getClientIp, rateLimit, pruneBuckets, badRequest, json, fallbackWhatsApp } from "@/lib/api";
import { PRODUCTS } from "@/data/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  pruneBuckets();
  const ip = getClientIp(request);
  const limit = rateLimit(`quote:${ip}`, 12, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `You have sent several requests from this connection. Please call +254 112 272 061 or try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.`,
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

  const parsed = quoteRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest("Please check the highlighted fields and try again.", {
      fieldErrors: fieldErrors(parsed.error),
    });
  }

  const data = parsed.data;

  // Per product validation of the step 2 answers.
  const detailSchema = QUOTE_DETAIL_SCHEMAS[data.insuranceType];
  const detailsParsed = detailSchema.safeParse(data.details);
  if (!detailsParsed.success) {
    const issues = fieldErrors(detailsParsed.error);
    return badRequest("Some details about the risk are missing or out of range.", {
      fieldErrors: issues,
    });
  }

  const captcha = await verifyCaptcha({
    token: data.captchaToken,
    expectedAction: "quote_request",
    version: data.captchaVersion ?? "v3",
    remoteIp: ip,
  });

  if (!captcha.ok) {
    // The score was too low: ask the browser for the v2 checkbox instead.
    if (captcha.reason === "low-score") {
      return json(
        {
          ok: false,
          error: "We need one extra step to confirm you are a person.",
          captcha: {
            ok: false,
            reason: captcha.reason,
            score: captcha.score,
            needsV2: true,
            detail: captcha.detail,
          },
        },
        400,
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not verify this submission. Please refresh the page and try again, or contact us directly and we will take your details.",
        captcha: { ok: false, reason: captcha.reason, detail: captcha.detail },
        whatsappLink: fallbackWhatsApp(),
      },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const reference = makeReference("quote");
  const product = PRODUCTS.find((item) => item.slug === data.insuranceType);

  const record = {
    id: reference,
    reference,
    createdAt: new Date().toISOString(),
    kind: "quotation" as const,
    insuranceType: data.insuranceType,
    productName: product?.name ?? data.insuranceType,
    details: detailsParsed.data,
    fullName: data.fullName,
    idNumber: data.idNumber,
    phone: data.phone,
    email: data.email,
    county: data.county,
    preferredContact: data.preferredContact,
    notes: data.notes ?? "",
    captcha: captchaSummary(captcha),
    captchaSkipped: captcha.skipped,
    source: data.source ?? "website-quote-form",
    ip,
    userAgent: request.headers.get("user-agent") ?? "unknown",
  };

  const { backend } = await append(KEYS.quotations, record);

  const brokerMessage = brokerQuoteMessage({
    reference,
    product: record.productName,
    fullName: data.fullName,
    phone: data.phone,
    email: data.email,
    county: data.county,
    answers: detailsParsed.data as Record<string, string | number>,
  });

  const clientMessage = clientConfirmationMessage({
    reference,
    fullName: data.fullName,
    product: record.productName,
  });

  const [brokerOutcome, clientOutcome] = await Promise.all([
    notifyBroker(brokerMessage),
    confirmToClient(data.phone, clientMessage),
  ]);

  // Email is the safety net for the broker: sent when WhatsApp could not deliver.
  let emailDelivered = "not needed";
  if (!brokerOutcome.delivered) {
    const mail = await sendMail({
      subject: `Quotation request ${reference} - ${record.productName}`,
      text: plainLead({
        Reference: reference,
        Product: record.productName,
        Name: data.fullName,
        Phone: data.phone,
        Email: data.email,
        County: data.county,
        "Preferred contact": data.preferredContact,
        Details: JSON.stringify(detailsParsed.data),
        Notes: data.notes ?? "",
        "Captcha": record.captcha,
      }),
      html: leadHtml(`Quotation request ${reference}`, {
        Product: record.productName,
        Name: data.fullName,
        Phone: data.phone,
        Email: data.email,
        County: data.county,
        "Preferred contact": data.preferredContact,
        Details: JSON.stringify(detailsParsed.data),
        Notes: data.notes ?? "",
      }),
      replyTo: data.email,
    });
    emailDelivered = mail.delivered ? "sent" : `not sent (${mail.reason})`;
  }

  const notes: string[] = [];
  const storageNote = storageWarning();
  if (storageNote) notes.push(storageNote);
  if (!brokerOutcome.delivered) notes.push(`Broker WhatsApp: ${brokerOutcome.reason}`);
  if (!clientOutcome.delivered) notes.push(`Client WhatsApp: ${clientOutcome.reason}`);

  console.info(`[api/quote] ${reference} stored in ${backend}. Broker WhatsApp: ${brokerOutcome.delivered}.`);

  return json({
    ok: true,
    reference,
    message: "Your quotation request has been received. A licensed broker will contact you within 24 hours.",
    delivery: {
      brokerWhatsApp: brokerOutcome.delivered ? "sent" : "not sent",
      clientWhatsApp: clientOutcome.delivered ? "sent" : "not sent",
      email: emailDelivered,
      storage: backendName(),
      notes,
    },
    whatsappLink: quoteRequestLink(reference),
  });
}

export async function GET() {
  return badRequest("Use POST to submit a quotation request.");
}
