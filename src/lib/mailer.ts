/**
 * Email through Nodemailer.
 *
 * Used by /api/contact for general enquiries, and as the fallback notification
 * channel for every other form when WhatsApp Cloud API credentials are not set:
 * a lead that cannot be delivered by WhatsApp is still delivered to the broker’s
 * inbox. Without SMTP credentials the message is logged (never dropped silently)
 * and the API response says so.
 */
import { capabilities, serverEnv } from "@/lib/env";
import { SITE } from "@/lib/site";

export interface MailInput {
  to?: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export type MailOutcome =
  | { delivered: true; to: string; messageId?: string }
  | { delivered: false; to: string; reason: string };

export async function sendMail(input: MailInput): Promise<MailOutcome> {
  const to = input.to ?? serverEnv.mailToBroker;

  if (!capabilities.mail) {
    console.info(
      `[mailer] SMTP is not configured. Message not sent.\nTo: ${to}\nSubject: ${input.subject}\n\n${input.text}`,
    );
    return {
      delivered: false,
      to,
      reason:
        "SMTP_HOST, SMTP_USER and SMTP_PASSWORD are not configured. The message was logged on the server instead.",
    };
  }

  try {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: serverEnv.smtpHost,
      port: serverEnv.smtpPort,
      secure: serverEnv.smtpSecure,
      auth: { user: serverEnv.smtpUser, pass: serverEnv.smtpPassword },
    });

    const info = await transport.sendMail({
      from: serverEnv.mailFrom,
      to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
    });

    return { delivered: true, to, messageId: info.messageId };
  } catch (error) {
    console.error("[mailer] send failed", error);
    return { delivered: false, to, reason: `SMTP send failed: ${(error as Error).message}` };
  }
}

/** Plain text lead body, used when no HTML template is supplied. */
export const plainLead = (fields: Record<string, string | number | undefined>): string =>
  Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

/** Minimal, readable HTML wrapper. Inline styles only, so it survives every client. */
export const leadHtml = (title: string, fields: Record<string, string | number | undefined>): string => {
  const rows = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(
      ([key, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#696E77;font:14px Roboto,Arial,sans-serif;vertical-align:top">${key}</td><td style="padding:6px 0;color:#15233C;font:500 14px Roboto,Arial,sans-serif">${String(
          value,
        ).replace(/</g, "&lt;")}</td></tr>`,
    )
    .join("");

  return `<div style="background:#F6F7FC;padding:24px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #E4E7EF;border-radius:10px;overflow:hidden">
    <div style="background:#015FC9;padding:18px 22px;color:#fff;font:600 18px Poppins,Arial,sans-serif">${title}</div>
    <table style="border-collapse:collapse;padding:22px" cellpadding="0" cellspacing="0"><tbody>${rows}</tbody></table>
    <div style="padding:14px 22px;background:#15233C;color:#C9CEDD;font:12px Roboto,Arial,sans-serif">
      ${SITE.name}, licensed by IRA Kenya. Licence No: ${SITE.iraLicenseNumber}. Member of AKI.
    </div>
  </div>
</div>`;
};
