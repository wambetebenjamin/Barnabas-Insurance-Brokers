"use client";

/**
 * Newsletter signup (brief section 13).
 *
 * "Insurance tips and renewal reminders for Kenya." Email input, reCAPTCHA v3,
 * subscribers stored in Vercel KV. Placed in the footer and on the contact page.
 */
import { useState } from "react";
import { useLeadSubmit } from "@/components/forms/useLeadSubmit";
import { CaptchaV2 } from "@/components/forms/CaptchaV2";
import { Field, Input } from "@/components/forms/Fields";

export function NewsletterForm({ variant = "page" }: { variant?: "footer" | "page" }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { status, submit, submitWithV2Token, result, error, fieldErrors, isSending } =
    useLeadSubmit<{
      ok: boolean;
      reference?: string;
      message?: string;
      error?: string;
      fieldErrors?: Record<string, string>;
      captcha?: { ok: boolean; reason: string; needsV2?: boolean };
    }>({ endpoint: "/api/newsletter", action: "newsletter_signup" });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError("Enter a valid email address");
      return;
    }
    if (!consent) {
      setLocalError("Please confirm you would like to receive the newsletter");
      return;
    }

    void submit({ email, consent: true, source: variant === "footer" ? "footer" : "contact-page" });
  };

  if (status === "success") {
    return (
      <div className={variant === "footer" ? "" : "b-alert b-alert--ok"} role="status">
        <i className="bi bi-check-circle-fill" aria-hidden="true" />{" "}
        {result?.message ??
          "You are on the list. Look out for insurance tips and renewal reminders from our brokers."}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={variant === "footer" ? "" : "b-form"} noValidate>
      <label className="b-visually-hidden" htmlFor="newsletter-email">
        Your email address
      </label>
      <div className="b-newsletter">
        <input
          id="newsletter-email"
          className="b-input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="your.name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(localError) || undefined}
          required
        />
        <button type="submit" className="btn btn-secondary" disabled={isSending}>
          {isSending ? "Signing up" : "Sign Up"}
        </button>
      </div>

      {variant === "page" ? (
        <div style={{ marginTop: 14 }}>
          <Field label="What should we send you?" htmlFor="newsletter-interests" hint="Optional. We never sell your details.">
            <p className="b-meta mb-0" id="newsletter-interests">
              Insurance tips and renewal reminders for Kenya. One email a month, unsubscribe with
              one click.
            </p>
          </Field>
          <label className="b-option" style={{ marginTop: 8 }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>
              <strong>I would like to receive the newsletter</strong>
              <span>
                You can withdraw this consent at any time under the Kenya Data Protection Act 2019.
              </span>
            </span>
          </label>
        </div>
      ) : (
        <label className="b-option" style={{ marginTop: 10, borderColor: "rgba(255,255,255,.22)", background: "transparent" }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>
            <strong style={{ color: "#fff" }}>Send me the newsletter</strong>
            <span style={{ color: "#9FA6BB" }}>
              One email a month. Unsubscribe any time.
            </span>
          </span>
        </label>
      )}

      <CaptchaV2
        active={status === "captcha"}
        onToken={(token) => {
          if (token) void submitWithV2Token(token);
        }}
      />

      {localError ? (
        <p className="b-error" role="alert" style={{ marginTop: 8 }}>
          {localError}
        </p>
      ) : null}
      {error ? (
        <p className="b-error" role="alert" style={{ marginTop: 8 }}>
          {error}
        </p>
      ) : null}
      {fieldErrors.email ? (
        <p className="b-error" role="alert" style={{ marginTop: 8 }}>
          {fieldErrors.email}
        </p>
      ) : null}
    </form>
  );
}
