"use client";

/**
 * The submission flow every form on the site shares.
 *
 *   1. ask reCAPTCHA v3 (invisible) for a token for this form’s action
 *   2. POST the payload to the API route
 *   3. if the server says the v3 score was below 0.5, show the v2 checkbox and
 *      resubmit the same payload with the v2 token (brief: "v2 fallback under 0.5")
 *   4. surface the reference number and the WhatsApp delivery status honestly,
 *      including when WhatsApp is not configured and the deep link is the route
 *
 * Nothing here decides whether a lead is genuine: that is the server’s call, and
 * the server records its decision on the lead.
 */
import { useCallback, useRef, useState } from "react";
import { getV3Token } from "@/lib/captcha-client";

export type SubmitStatus = "idle" | "sending" | "captcha" | "success" | "error";

export interface LeadResponse {
  ok: boolean;
  reference?: string;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  captcha?: {
    ok: boolean;
    reason: string;
    score?: number | null;
    needsV2?: boolean;
    detail?: string;
  };
  delivery?: {
    brokerWhatsApp?: string;
    clientWhatsApp?: string;
    email?: string;
    storage?: string;
    notes?: string[];
  };
  whatsappLink?: string;
  [key: string]: unknown;
}

export function useLeadSubmit<T extends LeadResponse>({
  endpoint,
  action,
}: {
  endpoint: string;
  action: string;
}) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const lastPayload = useRef<Record<string, unknown> | null>(null);

  const send = useCallback(
    async (payload: Record<string, unknown>, captchaVersion: "v3" | "v2", token: string | null) => {
      setStatus("sending");
      setError(null);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            captchaToken: token ?? undefined,
            captchaVersion,
          }),
        });

        const data = (await response.json().catch(() => null)) as T | null;

        if (!data) {
          setStatus("error");
          setError(
            "We could not read the server response. Please try again, or WhatsApp us on +254 112 272 061.",
          );
          return;
        }

        if (response.ok && data.ok) {
          setResult(data);
          setStatus("success");
          return;
        }

        if (response.status === 400 && data.captcha?.needsV2) {
          // Low score: switch to the visible checkbox and keep the payload.
          setFieldErrors(data.fieldErrors ?? {});
          setStatus("captcha");
          return;
        }

        setFieldErrors(data.fieldErrors ?? {});
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
      } catch (networkError) {
        setStatus("error");
        setError(
          `We could not reach the server (${(networkError as Error).message}). Check your connection and try again, or WhatsApp us on +254 112 272 061.`,
        );
      }
    },
    [endpoint],
  );

  /** Start a submission. */
  const submit = useCallback(
    async (payload: Record<string, unknown>) => {
      lastPayload.current = payload;
      const token = await getV3Token(action);
      await send(payload, "v3", token);
    },
    [action, send],
  );

  /** Called by the v2 widget once the visitor has ticked the box. */
  const submitWithV2Token = useCallback(
    async (token: string) => {
      if (!lastPayload.current) return;
      await send(lastPayload.current, "v2", token);
    },
    [send],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setFieldErrors({});
    lastPayload.current = null;
  }, []);

  return {
    status,
    result,
    error,
    fieldErrors,
    submit,
    submitWithV2Token,
    reset,
    isSending: status === "sending",
  };
}
