"use client";

/**
 * Online claim notification (brief section 9).
 *
 * Policy number, insurer, incident date and description, supporting documents
 * uploaded to Vercel Blob, reCAPTCHA v3, and /api/claim notifies the broker team.
 *
 * The upload step is honest about where files went: when Vercel Blob is not
 * configured the form still accepts the claim and tells the client to send the
 * documents by WhatsApp or email, rather than silently dropping an attachment.
 */
import { useRef, useState } from "react";
import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/site";
import { isValidKenyanPhone } from "@/lib/format";
import { Field, Input, Select, Textarea, ConsentCheckbox } from "@/components/forms/Fields";
import { CaptchaV2 } from "@/components/forms/CaptchaV2";
import { useLeadSubmit } from "@/components/forms/useLeadSubmit";

interface UploadedDocument {
  name: string;
  size: number;
  type: string;
  url: string;
  pathname?: string;
}

const MAX_FILES = 8;
const MAX_BYTES = 8 * 1024 * 1024;

const INCIDENT_TYPES = [
  { value: "motor-accident", label: "Motor accident" },
  { value: "theft", label: "Theft or burglary" },
  { value: "fire", label: "Fire or explosion" },
  { value: "medical", label: "Medical or hospital claim" },
  { value: "property-damage", label: "Property damage" },
  { value: "death", label: "Life or last expense claim" },
  { value: "other", label: "Something else" },
];

export function ClaimForm({ portalMode = false }: { portalMode?: boolean }) {
  const [policyNumber, setPolicyNumber] = useState("");
  const [insurer, setInsurer] = useState("");
  const [claimantName, setClaimantName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentType, setIncidentType] = useState("motor-accident");
  const [description, setDescription] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInput = useRef<HTMLInputElement>(null);

  const { status, submit, submitWithV2Token, result, error, fieldErrors, isSending } = useLeadSubmit<{
    ok: boolean;
    reference?: string;
    message?: string;
    error?: string;
    fieldErrors?: Record<string, string>;
    whatsappLink?: string;
    delivery?: { brokerWhatsApp?: string; storage?: string; notes?: string[] };
  }>({ endpoint: "/api/claim", action: "claim_notification" });

  const onFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).slice(0, MAX_FILES - documents.length);

    const tooBig = files.find((file) => file.size > MAX_BYTES);
    if (tooBig) {
      setUploadNote(`${tooBig.name} is larger than 8MB. Please compress it or send it on WhatsApp.`);
      return;
    }

    setUploading(true);
    setUploadNote(null);

    const form = new FormData();
    for (const file of files) form.append("documents", file);

    try {
      const response = await fetch("/api/claim/upload", { method: "POST", body: form });
      const data = (await response.json()) as {
        ok: boolean;
        files?: UploadedDocument[];
        stored?: boolean;
        error?: string;
        note?: string;
      };

      if (!data.ok) {
        setUploadNote(data.error ?? "The upload failed. You can still submit the claim and send the documents afterwards.");
      } else {
        setDocuments((current) => [...current, ...(data.files ?? [])]);
        if (data.note) setUploadNote(data.note);
      }
    } catch (uploadError) {
      setUploadNote(
        `The upload failed (${(uploadError as Error).message}). Submit the claim anyway and we will request the documents.`,
      );
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (policyNumber.trim().length < 3) next.policyNumber = "Enter the policy number from your schedule";
    if (insurer.trim().length < 2) next.insurer = "Which insurer issued the policy? Enter the name or leave as 'not sure'";
    if (claimantName.trim().length < 2) next.claimantName = "Who is making the claim?";
    if (!isValidKenyanPhone(phone)) next.phone = "Enter a Kenyan phone number";
    if (!incidentDate) next.incidentDate = "When did the incident happen?";
    if (description.trim().length < 20) next.description = "Describe what happened in at least a sentence";
    if (!consent) next.consent = "Please give your consent so we can process this claim";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    void submit({
      policyNumber,
      insurer,
      claimantName,
      phone,
      email: email || undefined,
      incidentDate,
      incidentType,
      description,
      estimatedValue: estimatedValue ? Number(estimatedValue) : undefined,
      documents,
      consent: true,
    });
  };

  if (status === "success" && result) {
    return (
      <div className="b-form" role="status" aria-live="polite">
        <div className="b-alert b-alert--ok" style={{ marginBottom: 18 }}>
          <i className="bi bi-check-circle-fill" aria-hidden="true" />
          <span>
            <strong>{result.message ?? "Your claim notification has reached our claims team."}</strong>
          </span>
        </div>
        <dl className="b-kv">
          <dt>Claim reference</dt>
          <dd>
            <span className="b-ref">{result.reference}</span>
          </dd>
          <dt>Policy</dt>
          <dd>{policyNumber}</dd>
          <dt>What happens next</dt>
          <dd>
            Our claims team notifies {insurer} with your reference today and sends you the document
            checklist the insurer requires. Keep your reference number for every follow up.
          </dd>
          {documents.length > 0 ? (
            <>
              <dt>Documents received</dt>
              <dd>{documents.map((document) => document.name).join(", ")}</dd>
            </>
          ) : null}
        </dl>
        <div className="b-formnav" style={{ justifyContent: "flex-start" }}>
          <a
            className="btn btn-primary"
            href={result.whatsappLink ?? whatsappLink(`Hello Barnabas Insurance Brokers. I notified claim ${result.reference} for policy ${policyNumber}.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-whatsapp" aria-hidden="true" /> Follow up on WhatsApp
          </a>
          <a className="btn b-btn-ghost" href={SITE.phoneHref}>
            Call {SITE.phone}
          </a>
        </div>
      </div>
    );
  }

  return (
    <form className="b-form" onSubmit={onSubmit} noValidate id="claim-form">
      <h2 style={{ fontSize: 22, marginBottom: 6 }}>Notify us of a claim</h2>
      <p className="b-lead" style={{ marginBottom: 20 }}>
        Send us the details and we will open the claim with your insurer today. If anyone was injured,
        seek medical help first and call us after.
      </p>

      <div className="b-option-grid">
        <Field label="Policy number" htmlFor="policyNumber" required hint="On your policy schedule or certificate." error={errors.policyNumber ?? fieldErrors.policyNumber}>
          <Input id="policyNumber" value={policyNumber} onChange={(event) => setPolicyNumber(event.target.value)} invalid={Boolean(errors.policyNumber ?? fieldErrors.policyNumber)} />
        </Field>
        <Field label="Insurer" htmlFor="claim-insurer" required hint="Not sure? Enter 'not sure' and we will find it from the policy number." error={errors.insurer ?? fieldErrors.insurer}>
          <Input id="claim-insurer" value={insurer} onChange={(event) => setInsurer(event.target.value)} invalid={Boolean(errors.insurer ?? fieldErrors.insurer)} />
        </Field>
      </div>

      <div className="b-option-grid">
        <Field label="Claimant name" htmlFor="claimantName" required error={errors.claimantName ?? fieldErrors.claimantName}>
          <Input id="claimantName" autoComplete="name" value={claimantName} onChange={(event) => setClaimantName(event.target.value)} invalid={Boolean(errors.claimantName ?? fieldErrors.claimantName)} />
        </Field>
        <Field label="Phone number" htmlFor="claim-phone" required error={errors.phone ?? fieldErrors.phone}>
          <Input id="claim-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" value={phone} onChange={(event) => setPhone(event.target.value)} invalid={Boolean(errors.phone ?? fieldErrors.phone)} />
        </Field>
      </div>

      <div className="b-option-grid">
        <Field label="Email address" htmlFor="claim-email" hint="Optional, but useful for sending the document checklist.">
          <Input id="claim-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label="Date of incident" htmlFor="incidentDate" required error={errors.incidentDate ?? fieldErrors.incidentDate}>
          <Input id="incidentDate" type="date" max={new Date().toISOString().slice(0, 10)} value={incidentDate} onChange={(event) => setIncidentDate(event.target.value)} invalid={Boolean(errors.incidentDate ?? fieldErrors.incidentDate)} />
        </Field>
      </div>

      <div className="b-option-grid">
        <Field label="Type of claim" htmlFor="incidentType" required>
          <Select id="incidentType" value={incidentType} onChange={(event) => setIncidentType(event.target.value)}>
            {INCIDENT_TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Estimated value (KES)" htmlFor="estimatedValue" hint="Optional. Your best estimate of the loss.">
          <Input id="estimatedValue" type="number" inputMode="numeric" min={0} step={1000} value={estimatedValue} onChange={(event) => setEstimatedValue(event.target.value)} />
        </Field>
      </div>

      <Field label="What happened?" htmlFor="description" required hint="Include the location, who was involved, and whether a police abstract was obtained." error={errors.description ?? fieldErrors.description}>
        <Textarea id="description" rows={5} value={description} onChange={(event) => setDescription(event.target.value)} invalid={Boolean(errors.description ?? fieldErrors.description)} />
      </Field>

      <Field label="Supporting documents" htmlFor="documents" hint="Up to 8 files, 8MB each. Police abstract, photographs, invoices, medical reports, or a completed claim form.">
        <input
          ref={fileInput}
          id="documents"
          className="b-input"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
          onChange={(event) => void onFiles(event.target.files)}
          disabled={uploading || documents.length >= MAX_FILES}
          style={{ paddingTop: 12 }}
        />
      </Field>

      {uploading ? (
        <p className="b-hint" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          Uploading your documents
        </p>
      ) : null}

      {uploadNote ? (
        <div className="b-alert b-alert--info" style={{ marginBottom: 14 }}>
          <i className="bi bi-info-circle" aria-hidden="true" />
          <span>{uploadNote}</span>
        </div>
      ) : null}

      {documents.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0, marginBottom: 16 }}>
          {documents.map((document, index) => (
            <li key={`${document.name}-${index}`} className="b-msg" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <i className="bi bi-paperclip" aria-hidden="true" />
              <span style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: "block", fontSize: 15, color: "var(--b-dark)" }}>{document.name}</strong>
                <span className="b-meta">{(document.size / 1024).toFixed(0)} KB</span>
              </span>
              <button
                type="button"
                className="btn b-btn-ghost"
                style={{ minHeight: 44 }}
                onClick={() => setDocuments((current) => current.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <ConsentCheckbox id="claim-consent" checked={consent} onChange={setConsent} error={errors.consent}>
        I confirm the information above is accurate and agree that Barnabas Insurance Brokers may
        share it with my insurer and its loss adjusters to process this claim. See our{" "}
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
            {error} Call <a href={SITE.phoneHref}>{SITE.phone}</a> if this claim is urgent.
          </span>
        </div>
      ) : null}

      <div className="b-formnav">
        <p className="b-captcha-note mb-0" style={{ maxWidth: "44ch" }}>
          {portalMode
            ? "Submitting from your portal means the details are already linked to your policy."
            : "We acknowledge every claim notification the same working day."}
        </p>
        <button type="submit" className="btn btn-primary" disabled={isSending || uploading}>
          {isSending ? (
            <>
              <span className="spinner-border spinner-border-sm" aria-hidden="true" /> Sending
            </>
          ) : (
            <>
              <i className="bi bi-send" aria-hidden="true" /> Notify a claim
            </>
          )}
        </button>
      </div>
    </form>
  );
}
