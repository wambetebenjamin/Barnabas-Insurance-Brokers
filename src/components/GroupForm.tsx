"use client";

/**
 * Corporate and group scheme enquiry (brief section 8).
 *
 * Company name, industry, contact name, email, phone, number of employees and the
 * cover needed, with reCAPTCHA v3. POST /api/group stores the enquiry in Vercel KV
 * and sends the broker a WhatsApp notification and an email.
 */
import { useState } from "react";
import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/site";
import { isValidKenyanPhone } from "@/lib/format";
import { Field, Input, Select, Textarea, Option, ConsentCheckbox } from "@/components/forms/Fields";
import { CaptchaV2 } from "@/components/forms/CaptchaV2";
import { useLeadSubmit } from "@/components/forms/useLeadSubmit";

const INDUSTRIES = [
  "Agriculture and agribusiness",
  "Construction and real estate",
  "Education and training",
  "Financial services",
  "Healthcare and pharmaceuticals",
  "Hospitality and tourism",
  "Manufacturing",
  "Mining and energy",
  "NGO and development",
  "Professional services",
  "Retail and distribution",
  "Technology and media",
  "Transport and logistics",
  "Other",
];

const COVERS = [
  "Group medical scheme",
  "Group life and last expense",
  "Employer’s liability and WIBA",
  "Fire and special perils",
  "Burglary and theft",
  "Public liability",
  "Goods in transit and marine cargo",
  "Business interruption",
  "Directors and officers liability",
  "Machinery breakdown",
  "Money insurance",
  "Cyber liability",
];

export function GroupForm() {
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [employees, setEmployees] = useState("");
  const [covers, setCovers] = useState<string[]>(["Group medical scheme"]);
  const [currentScheme, setCurrentScheme] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { status, submit, submitWithV2Token, result, error, fieldErrors, isSending } = useLeadSubmit<{
    ok: boolean;
    reference?: string;
    message?: string;
    error?: string;
    fieldErrors?: Record<string, string>;
    whatsappLink?: string;
    delivery?: { brokerWhatsApp?: string; email?: string; storage?: string };
  }>({ endpoint: "/api/group", action: "group_enquiry" });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (companyName.trim().length < 2) next.companyName = "Enter the company name";
    if (!industry) next.industry = "Select your industry";
    if (contactName.trim().length < 2) next.contactName = "Enter the contact person’s name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid work email address";
    if (!isValidKenyanPhone(phone)) next.phone = "Enter a Kenyan phone number";
    if (!Number(employees)) next.employees = "How many employees should be covered?";
    if (covers.length === 0) next.covers = "Select at least one cover";
    if (!consent) next.consent = "Please give your consent so we can process this enquiry";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    void submit({
      companyName,
      industry,
      contactName,
      email,
      phone,
      employees,
      coversNeeded: covers,
      currentScheme,
      notes,
      consent: true,
    });
  };

  if (status === "success" && result) {
    return (
      <div className="b-form" role="status" aria-live="polite">
        <div className="b-alert b-alert--ok" style={{ marginBottom: 18 }}>
          <i className="bi bi-check-circle-fill" aria-hidden="true" />
          <span>
            <strong>{result.message ?? "Thank you, your enquiry has reached our corporate desk."}</strong>
          </span>
        </div>
        <dl className="b-kv">
          <dt>Your reference</dt>
          <dd>
            <span className="b-ref">{result.reference}</span>
          </dd>
          <dt>What happens next</dt>
          <dd>
            A corporate broker will call {contactName} within one working day to discuss the
            scheme structure, then send a written proposal with options from the insurers we
            compare.
          </dd>
        </dl>
        <div className="b-formnav" style={{ justifyContent: "flex-start" }}>
          <a
            className="btn btn-primary"
            href={result.whatsappLink ?? whatsappLink(`Hello Barnabas Insurance Brokers. I sent group scheme enquiry ${result.reference}.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-whatsapp" aria-hidden="true" /> Continue on WhatsApp
          </a>
          <Link className="btn b-btn-ghost" href="/products/business-insurance">
            Read about business cover
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="b-form" onSubmit={onSubmit} noValidate id="group-enquiry">
      <h2 style={{ fontSize: 22, marginBottom: 6 }}>Group scheme enquiry</h2>
      <p className="b-lead" style={{ marginBottom: 20 }}>
        Tell us about your organisation and we will design the scheme around your staff, not around a
        standard template.
      </p>

      <div className="b-option-grid">
        <Field label="Company name" htmlFor="companyName" required error={errors.companyName ?? fieldErrors.companyName}>
          <Input id="companyName" autoComplete="organization" value={companyName} onChange={(event) => setCompanyName(event.target.value)} invalid={Boolean(errors.companyName ?? fieldErrors.companyName)} />
        </Field>
        <Field label="Industry" htmlFor="industry" required error={errors.industry ?? fieldErrors.industry}>
          <Select id="industry" value={industry} onChange={(event) => setIndustry(event.target.value)} invalid={Boolean(errors.industry ?? fieldErrors.industry)}>
            <option value="">Select your industry</option>
            {INDUSTRIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="b-option-grid">
        <Field label="Contact person" htmlFor="contactName" required error={errors.contactName ?? fieldErrors.contactName}>
          <Input id="contactName" autoComplete="name" placeholder="HR manager, finance, or director" value={contactName} onChange={(event) => setContactName(event.target.value)} invalid={Boolean(errors.contactName ?? fieldErrors.contactName)} />
        </Field>
        <Field label="Phone number" htmlFor="group-phone" required error={errors.phone ?? fieldErrors.phone}>
          <Input id="group-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" value={phone} onChange={(event) => setPhone(event.target.value)} invalid={Boolean(errors.phone ?? fieldErrors.phone)} />
        </Field>
      </div>

      <div className="b-option-grid">
        <Field label="Work email" htmlFor="group-email" required error={errors.email ?? fieldErrors.email}>
          <Input id="group-email" type="email" inputMode="email" autoComplete="email" placeholder="you@company.co.ke" value={email} onChange={(event) => setEmail(event.target.value)} invalid={Boolean(errors.email ?? fieldErrors.email)} />
        </Field>
        <Field label="Number of employees" htmlFor="employees" required hint="Include staff on contract if you want them covered." error={errors.employees ?? fieldErrors.employees}>
          <Input id="employees" type="number" inputMode="numeric" min={1} placeholder="25" value={employees} onChange={(event) => setEmployees(event.target.value)} invalid={Boolean(errors.employees ?? fieldErrors.employees)} />
        </Field>
      </div>

      <fieldset className="b-fieldset">
        <legend>Cover needed</legend>
        <div className="b-option-grid">
          {COVERS.map((cover) => {
            const selected = covers.includes(cover);
            return (
              <Option
                key={cover}
                type="checkbox"
                name="groupCovers"
                value={cover}
                checked={selected}
                onChange={() =>
                  setCovers((current) =>
                    current.includes(cover) ? current.filter((item) => item !== cover) : [...current, cover],
                  )
                }
                title={cover}
              />
            );
          })}
        </div>
        {errors.covers ? (
          <span className="b-error" role="alert">
            {errors.covers}
          </span>
        ) : null}
      </fieldset>

      <div className="b-option-grid">
        <Field label="Current scheme or insurer" htmlFor="currentScheme" hint="Optional. Helps us show you where the current terms can be improved.">
          <Input id="currentScheme" value={currentScheme} onChange={(event) => setCurrentScheme(event.target.value)} />
        </Field>
      </div>

      <Field label="Anything specific we should know?" htmlFor="group-notes" hint="Optional. Age profile, budget per employee, renewal date, or claims history.">
        <Textarea id="group-notes" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
      </Field>

      <ConsentCheckbox id="group-consent" checked={consent} onChange={setConsent} error={errors.consent}>
        I agree that Barnabas Insurance Brokers may use these details to prepare a scheme proposal and
        to contact me. See our{" "}
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
            {error} You can also <a href={whatsappLink()}>reach the corporate desk on WhatsApp</a> or
            call <a href={SITE.phoneHref}>{SITE.phone}</a>.
          </span>
        </div>
      ) : null}

      <div className="b-formnav">
        <p className="b-captcha-note mb-0" style={{ maxWidth: "42ch" }}>
          Protected by reCAPTCHA. We reply to every enquiry within one working day.
        </p>
        <button type="submit" className="btn btn-primary" disabled={isSending}>
          {isSending ? (
            <>
              <span className="spinner-border spinner-border-sm" aria-hidden="true" /> Sending
            </>
          ) : (
            <>
              <i className="bi bi-send" aria-hidden="true" /> Send enquiry
            </>
          )}
        </button>
      </div>
    </form>
  );
}
