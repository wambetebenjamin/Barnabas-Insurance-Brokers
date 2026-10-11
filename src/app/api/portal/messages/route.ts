/**
 * /api/portal/messages - message the broker from the client portal.
 *
 * GET  the conversation so far
 * POST a new message, which also notifies the broker desk so a portal message is
 *      never left sitting unseen
 */
import { auth } from "@/auth";
import { portalMessageSchema, fieldErrors } from "@/lib/schemas";
import { getMessages, addMessage } from "@/lib/portal";
import { makeReference } from "@/lib/reference";
import { notifyBroker, waLink } from "@/lib/whatsapp";
import { sendMail, plainLead } from "@/lib/mailer";
import { json, forbidden, badRequest } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!session || !email) return forbidden("Sign in to view your messages.");

  const messages = await getMessages(email);
  return json({ ok: true, messages, count: messages.length });
}

export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!session || !email) return forbidden("Sign in to send a message.");

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("The request body was not valid JSON.");
  }

  const parsed = portalMessageSchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest("Please check the message and try again.", { fieldErrors: fieldErrors(parsed.error) });
  }

  const { subject, body, policyReference } = parsed.data;
  const reference = makeReference("message");

  const stored = await addMessage(email, {
    id: reference,
    createdAt: new Date().toISOString(),
    from: "client",
    subject,
    body,
    policyReference,
  });

  const text = [
    "New portal message",
    "",
    `*Reference:* ${reference}`,
    `*Client:* ${session.user?.name ?? email}`,
    `*Email:* ${email}`,
    policyReference ? `*Policy:* ${policyReference}` : "",
    `*Subject:* ${subject}`,
    "",
    body,
  ]
    .filter(Boolean)
    .join("\n");

  const [whatsapp, mail] = await Promise.all([
    notifyBroker(text),
    sendMail({
      to: undefined,
      subject: `Portal message ${reference} - ${subject}`,
      text: plainLead({ Reference: reference, Client: email, Policy: policyReference ?? "", Subject: subject, Message: body }),
      replyTo: email,
    }),
  ]);

  return json({
    ok: true,
    reference,
    stored,
    message: "Your message has been sent to your broker. We reply during working hours.",
    delivery: {
      brokerWhatsApp: whatsapp.delivered ? "sent" : "not sent",
      email: mail.delivered ? "sent" : "not sent",
    },
    whatsappLink: waLink(`Hello Barnabas Insurance Brokers. I sent portal message ${reference}.`),
  });
}
