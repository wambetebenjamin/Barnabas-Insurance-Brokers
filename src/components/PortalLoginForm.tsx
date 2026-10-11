"use client";

/**
 * Portal sign in: request a code, then verify it through NextAuth.
 *
 * The code is verified server side by the Credentials provider; this component
 * never decides whether a code is correct. In preview mode the API returns the
 * code so the portal can be reviewed without SMTP, and the form says so plainly.
 */
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Field, Input } from "@/components/forms/Fields";
import { CaptchaV2 } from "@/components/forms/CaptchaV2";
import { getV3Token } from "@/lib/captcha-client";
import { SITE, whatsappLink } from "@/lib/site";

type Step = "request" | "verify";

export function PortalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/portal";

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [policyReference, setPolicyReference] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [demoHint, setDemoHint] = useState<string | null>(null);
  const [needsV2, setNeedsV2] = useState(false);
  const [v2Token, setV2Token] = useState("");

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter the email address we have on your policy.");
      return;
    }
    if (policyReference.trim().length < 6) {
      setError("Enter the policy reference from your schedule.");
      return;
    }

    setBusy(true);
    try {
      const token = await getV3Token("portal_login");
      const response = await fetch("/api/portal/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          policyReference,
          captchaToken: v2Token || token || undefined,
          captchaVersion: v2Token ? "v2" : "v3",
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        error?: string;
        demoCode?: string;
        demoHint?: string;
        captcha?: { needsV2?: boolean; reason?: string };
      };

      if (!data.ok) {
        if (data.captcha?.needsV2) {
          setNeedsV2(true);
          setError("Please complete the checkbox below, then try again.");
          return;
        }
        setError(data.error ?? "We could not send the code. Please try again.");
        return;
      }

      setStep("verify");
      setInfo(data.message ?? "We have emailed you a six digit code.");
      if (data.demoCode) setDemoCode(data.demoCode);
      if (data.demoHint) setDemoHint(data.demoHint);
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the six digit code from the email.");
      return;
    }

    setBusy(true);
    try {
      const result = await signIn("email-otp", {
        email,
        code,
        policyReference,
        redirect: false,
      });

      if (!result || result.error) {
        setError("That code was not accepted. Check the digits, or request a new code.");
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("Sign in failed. Please request a new code.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="b-form">
      <h2 style={{ fontSize: 22, marginBottom: 6 }}>
        {step === "request" ? "Sign in" : "Enter your code"}
      </h2>
      <p className="b-lead" style={{ fontSize: "var(--b-fs-body-sm)", marginBottom: 20 }}>
        {step === "request"
          ? "Your email address and policy reference, then a code we send you."
          : `We sent a code to ${email}. It expires in 10 minutes.`}
      </p>

      {step === "request" ? (
        <form onSubmit={requestCode} noValidate>
          <Field label="Email address" htmlFor="portal-email" required hint="The address we hold on your policy.">
            <Input
              id="portal-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>

          <Field
            label="Policy reference"
            htmlFor="portal-policy"
            required
            hint="From your schedule, for example BIB-P-250011-A1B2. Your insurer’s policy number works too."
          >
            <Input
              id="portal-policy"
              value={policyReference}
              onChange={(event) => setPolicyReference(event.target.value.toUpperCase())}
              required
            />
          </Field>

          <CaptchaV2
            active={needsV2}
            onToken={(token) => {
              setV2Token(token);
            }}
          />

          {info ? (
            <div className="b-alert b-alert--info" style={{ marginBottom: 14 }}>
              <i className="bi bi-info-circle" aria-hidden="true" />
              <span>{info}</span>
            </div>
          ) : null}

          {error ? (
            <p className="b-error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn btn-primary w-100" disabled={busy} style={{ minHeight: 48 }}>
            {busy ? "Sending the code" : "Send me a code"}
          </button>

          <p className="b-captcha-note">
            Protected by reCAPTCHA. Sign in is rate limited, and the response never reveals whether a
            policy reference exists.
          </p>
        </form>
      ) : (
        <form onSubmit={verify} noValidate>
          {demoCode ? (
            <div className="b-alert b-alert--info" style={{ marginBottom: 16 }}>
              <i className="bi bi-info-circle" aria-hidden="true" />
              <span>
                {demoHint ?? "Preview mode: the code is shown here instead of being emailed."}
                <br />
                <strong style={{ letterSpacing: "0.3em", fontSize: 20 }}>{demoCode}</strong>
              </span>
            </div>
          ) : null}

          <Field label="Six digit code" htmlFor="portal-code" required>
            <Input
              id="portal-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              style={{ letterSpacing: "0.4em", fontSize: 20, fontFamily: "Poppins, sans-serif" }}
              required
            />
          </Field>

          {error ? (
            <p className="b-error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn btn-primary w-100" disabled={busy} style={{ minHeight: 48 }}>
            {busy ? "Checking the code" : "Sign in"}
          </button>

          <div className="b-formnav" style={{ borderTop: "none", paddingTop: 12 }}>
            <button
              type="button"
              className="btn b-btn-ghost"
              onClick={() => {
                setStep("request");
                setCode("");
                setError(null);
              }}
            >
              Use a different email
            </button>
            <a
              className="btn b-link"
              style={{ color: "var(--b-primary)", fontSize: "var(--b-fs-body-sm)" }}
              href={whatsappLink("Hello Barnabas Insurance Brokers. I am having trouble signing in to the client portal.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Trouble signing in?
            </a>
          </div>
        </form>
      )}

      <p className="b-captcha-note mb-0">
        Need help? Call {SITE.phone} or WhatsApp us. We will never ask you for your code, your M-PESA
        PIN, or your password.
      </p>
    </div>
  );
}
