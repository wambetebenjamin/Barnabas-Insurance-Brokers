"use client";

/**
 * General enquiry form (brief section 14), reCAPTCHA v3, delivered to the broker
 * with Nodemailer through /api/contact.
 */
import { useState } from "react";
import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/site";
import { isValidKenyanPhone } from "@/lib/format";
import { Field, Input, Select, Textarea, ConsentCheckbox } from "@/components/forms/Fields";
import { CaptchaV2 } from "@/components/forms/CaptchaV2";
import { useLeadSubmit } from "@/components/forms/useLeadSubmit";

const SUBJECTS = [
  "New quotation",
  "Existing policy",
  "Claim",
  "Group medical scheme",
  "Careers",
  "Something else",
] as const;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>("New quotation");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { status, submit, submitWithV2Token, result, error, fieldErrors, isSending } = useLeadSubmit<{
    ok: boolean;
    reference?: string;
    message?: string;
    error?: string;
    fieldErrors?: Record<string, string>;
    delivery?: { email?: string; storage?: string; brokerWhatsApp?: string };
  }>({ endpoint: "/api/contact", action: "contact_form" });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address";
    if (!isValidKenyanPhone(phone)) next.phone = "Enter a Kenyan phone number";
    if (message.trim().length < 10) next.message = "Tell us how we can help";
    if (!consent) next.consent = "Please give your consent so we can reply";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    void submit({ name, email, phone, subject, message, consent: true });
  };

  if (status === "success" && result) {
    return (
      <div className="b-form" role="status" aria-live="polite">
        <div className="b-alert b-alert--ok" style={{ marginBottom: 18 }}>
          <i className="bi bi-check-circle-fill" aria-hidden="true" />
          <span>
            <strong>{result.message ?? "Thank you, your message has reached our broker desk."}</strong>
          </span>
        </div>
        <dl className="b-kv">
          <dt>Reference</dt>
          <dd>
            <span className="b-ref">{result.reference}</span>
          </dd>
          <dt>Reply</dt>
          <dd>
            We reply to messages during working hours, {SITE.hours}. If your enquiry is urgent, call{" "}
            <a href={SITE.phoneHref}>{SITE.phone}</a> or{" "}
            <a href={whatsappLink()}>message us on WhatsApp</a>.
          </dd>
        </dl>
      </div>
    );
  }

  return (
    <form className="b-form" onSubmit={onSubmit} noValidate id="contact-form">
      <h2 style={{ fontSize: 22, marginBottom: 6 }}>Send us a message</h2>
      <p className="b-lead" style={{ marginBottom: 20 }}>
        A licensed broker reads every message. Tell us what you need and we will reply during working
        hours.
      </p>

      <div className="b-option-grid">
        <Field label="Your name" htmlFor="contact-name" required error={errors.name ?? fieldErrors.name}>
          <Input id="contact-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} invalid={Boolean(errors.name ?? fieldErrors.name)} />
        </Field>
        <Field label="Email address" htmlFor="contact-email" required error={errors.email ?? fieldErrors.email}>
          <Input id="contact-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} invalid={Boolean(errors.email ?? fieldErrors.email)} />
        </Field>
      </div>

      <div className="b-option-grid">
        <Field label="Phone number" htmlFor="contact-phone" required error={errors.phone ?? fieldErrors.phone}>
          <Input id="contact-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" value={phone} onChange={(event) => setPhone(event.target.value)} invalid={Boolean(errors.phone ?? fieldErrors.phone)} />
        </Field>
        <Field label="What is it about?" htmlFor="contact-subject" required>
          <Select id="contact-subject" value={subject} onChange={(event) => setSubject(event.target.value as (typeof SUBJECTS)[number])}>
            {SUBJECTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="How can we help?" htmlFor="contact-message" required error={errors.message ?? fieldErrors.message}>
        <Textarea id="contact-message" rows={5} value={message} onChange={(event) => setMessage(event.target.value)} invalid={Boolean(errors.message ?? fieldErrors.message)} />
      </Field>

      <ConsentCheckbox id="contact-consent" checked={consent} onChange={setConsent} error={errors.consent}>
        I agree that Barnabas Insurance Brokers may store and use these details to respond to my
        enquiry, in line with the{" "}
        <Link href="/legal/privacy-policy" style={{ color: "inherit" }}>
          Privacy Policy
        </Link>
        .
      </ConsentCheckbox>

      <CaptchaV2
        active={status === "captcha"}
        onToken={(token) => {
          if (token) void submitWithV2Token(token);
        }}
      />

      {error ? (
        <div className="b-alert b-alert--error" role="alert" style={{ marginBottom: 14 }}>
          <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
          <span>
            {error} You can also call <a href={SITE.phoneHref}>{SITE.phone}</a>.
          </span>
        </div>
      ) : null}

      <div className="b-formnav">
        <p className="b-captcha-note mb-0" style={{ maxWidth: "44ch" }}>
          Protected by reCAPTCHA. We never ask for your password, PIN, or M-PESA details.
        </p>
        <button type="submit" className="btn btn-primary" disabled={isSending}>
          {isSending ? (
            <>
              <span className="spinner-border spinner-border-sm" aria-hidden="true" /> Sending
            </>
          ) : (
            <>
              <i className="bi bi-send" aria-hidden="true" /> Send message
            </>
          )}
        </button>
      </div>
    </form>
  );
}
