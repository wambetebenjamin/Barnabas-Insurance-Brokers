/**
 * WhatsApp integration.
 *
 * Two jobs, deliberately separated:
 *
 * 1. Deep links (always available, no credentials). Every lead response and the
 *    floating button carries a wa.me link with the message pre-filled, so even
 *    with no API credentials the broker receives the lead by tapping once.
 *
 * 2. Cloud API sends (optional). When WHATSAPP_API_TOKEN and
 *    WHATSAPP_PHONE_NUMBER_ID are set, the broker notification and the client
 *    confirmation are sent automatically. If the credentials are missing or the
 *    call fails, the function reports that honestly instead of pretending the
 *    message went out, and the caller falls back to email plus the deep link.
 *
 * The number and the default link are fixed by the brief:
 * https://wa.me/254112272061?text=Hello!%20I%20would%20like%20a%20free%20insurance%20quote%20from%20Barnabas%20Insurance%20Brokers.
 */
import { capabilities, serverEnv } from "@/lib/env";
import { SITE, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/site";
import { formatKes, formatNumber, normaliseKenyanPhone } from "@/lib/format";

export type WhatsAppOutcome =
  | { delivered: true; to: string; messageId?: string }
  | { delivered: false; to: string; reason: string; link: string };

export const waLink = (text: string, number: string = SITE.whatsappNumber): string =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

export const quoteRequestLink = (reference?: string): string =>
  waLink(
    reference
      ? `Hello Barnabas Insurance Brokers. I have submitted quotation request ${reference} and would like to follow up.`
      : WHATSAPP_DEFAULT_MESSAGE,
  );

async function send(
  to: string,
  text: string,
  previewUrl = false,
): Promise<WhatsAppOutcome> {
  const normalised = normaliseKenyanPhone(to);
  if (!capabilities.whatsappApi) {
    return {
      delivered: false,
      to: normalised,
      reason:
        "WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID are not configured, so the deep link is returned for the team to send manually.",
      link: waLink(text, normalised),
    };
  }

  try {
    const response = await fetch(
      `${serverEnv.whatsappApiUrl}/${serverEnv.whatsappPhoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serverEnv.whatsappApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: normalised,
          type: "text",
          text: { preview_url: previewUrl, body: text },
        }),
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return {
        delivered: false,
        to: normalised,
        reason: `WhatsApp Cloud API returned ${response.status}. ${detail.slice(0, 200)}`,
        link: waLink(text, normalised),
      };
    }

    const payload = (await response.json().catch(() => null)) as
      | { messages?: { id?: string }[] }
      | null;

    return { delivered: true, to: normalised, messageId: payload?.messages?.[0]?.id };
  } catch (error) {
    return {
      delivered: false,
      to: normalised,
      reason: `WhatsApp Cloud API request failed: ${(error as Error).message}`,
      link: waLink(text, normalised),
    };
  }
}

/* ------------------------------------------------------------ composition */

const line = (label: string, value?: string | number | null): string =>
  value === undefined || value === null || value === "" ? "" : `*${label}:* ${value}\n`;

export interface QuoteLead {
  reference: string;
  product: string;
  fullName: string;
  phone: string;
  email: string;
  county: string;
  answers: Record<string, string | number>;
}

export const brokerQuoteMessage = (lead: QuoteLead): string => {
  const details = Object.entries(lead.answers)
    .map(([key, value]) => line(key, typeof value === "number" ? formatNumber(value) : value))
    .join("");

  return [
    "New quotation request",
    "",
    line("Reference", lead.reference),
    line("Product", lead.product),
    line("Name", lead.fullName),
    line("Phone", lead.phone),
    line("Email", lead.email),
    line("County", lead.county),
    details.trim() ? `\n*Details*\n${details}` : "",
    `\nRespond within 24 hours. Open the lead in the portal or reply to this chat.`,
  ]
    .filter(Boolean)
    .join("\n");
};

export const clientConfirmationMessage = (
  lead: Pick<QuoteLead, "reference" | "fullName" | "product">,
): string =>
  [
    `Hello ${lead.fullName.split(" ")[0]}, thank you for requesting a quotation from Barnabas Insurance Brokers.`,
    "",
    line("Your reference", lead.reference),
    line("Cover requested", lead.product),
    "",
    "A licensed broker will call or WhatsApp you within 24 hours with options and prices from the insurers we have compared for you.",
    "",
    `Barnabas Insurance Brokers, licensed by IRA Kenya. Licence No: ${SITE.iraLicenseNumber}. Member of AKI.`,
  ].join("\n");

export const brokerGroupMessage = (lead: {
  reference: string;
  companyName: string;
  industry: string;
  contactName: string;
  phone: string;
  email: string;
  employees: string | number;
  covers: string[];
  notes?: string;
}): string =>
  [
    "New group scheme enquiry",
    "",
    line("Reference", lead.reference),
    line("Company", lead.companyName),
    line("Industry", lead.industry),
    line("Contact", lead.contactName),
    line("Phone", lead.phone),
    line("Email", lead.email),
    line("Employees", lead.employees),
    line("Cover needed", lead.covers.join(", ")),
    lead.notes ? `\n*Notes*\n${lead.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

export const brokerClaimMessage = (claim: {
  reference: string;
  policyNumber: string;
  insurer: string;
  claimant: string;
  phone: string;
  incidentDate: string;
  description: string;
  documents: string[];
}): string =>
  [
    "New claim notification",
    "",
    line("Reference", claim.reference),
    line("Policy number", claim.policyNumber),
    line("Insurer", claim.insurer),
    line("Claimant", claim.claimant),
    line("Phone", claim.phone),
    line("Incident date", claim.incidentDate),
    claim.documents.length ? line("Documents", `${claim.documents.length} uploaded`) : "",
    `\n*Description*\n${claim.description}`,
  ]
    .filter(Boolean)
    .join("\n");

export const brokerContactMessage = (lead: {
  reference: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}): string =>
  [
    "New website enquiry",
    "",
    line("Reference", lead.reference),
    line("Name", lead.name),
    line("Phone", lead.phone),
    line("Email", lead.email),
    line("Subject", lead.subject),
    `\n*Message*\n${lead.message}`,
  ]
    .filter(Boolean)
    .join("\n");

export const insurerComparisonMessage = (input: {
  product: string;
  profile: string;
  rows: { insurer: string; plan: string; premiumFrom: number; premiumTo: number }[];
}): string =>
  [
    "Comparison request from the website",
    "",
    line("Product", input.product),
    line("Profile", input.profile),
    "",
    ...input.rows.map(
      (row) =>
        `• ${row.insurer}, ${row.plan}, ${formatKes(row.premiumFrom)} to ${formatKes(row.premiumTo)}`,
    ),
  ].join("\n");

/* -------------------------------------------------------------- senders */

export const notifyBroker = (message: string): Promise<WhatsAppOutcome> =>
  send(serverEnv.whatsappBrokerNumber, message);

export const confirmToClient = (phone: string, message: string): Promise<WhatsAppOutcome> =>
  send(phone, message);

export const whatsappConfigured = (): boolean => capabilities.whatsappApi;
