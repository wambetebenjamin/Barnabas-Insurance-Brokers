"use client";

/**
 * reCAPTCHA v2 checkbox fallback (brief: "v2 fallback under 0.5").
 *
 * Rendered only after the server has told us the v3 score was below the
 * threshold. The widget is rendered explicitly so it can be mounted inline in the
 * form rather than relying on a global onload callback.
 */
import { useCallback, useEffect, useRef } from "react";
import { renderV2Checkbox, resetV2Checkbox, v2Enabled } from "@/lib/captcha-client";

export function CaptchaV2({
  active,
  onToken,
}: {
  active: boolean;
  onToken: (token: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  const handleToken = useCallback(
    (token: string) => {
      onToken(token);
    },
    [onToken],
  );

  useEffect(() => {
    if (!active || !v2Enabled() || !container.current || widgetId.current !== null) return;
    let cancelled = false;
    renderV2Checkbox(container.current, handleToken, () => {
      resetV2Checkbox(widgetId.current);
      onToken("");
    }).then((id) => {
      if (!cancelled) widgetId.current = id;
    });
    return () => {
      cancelled = true;
    };
  }, [active, handleToken, onToken]);

  if (!active) return null;

  if (!v2Enabled()) {
    return (
      <div className="b-alert b-alert--info b-captcha-slot">
        <i className="bi bi-info-circle" aria-hidden="true" />
        <span>
          We could not verify this submission automatically. Please{" "}
          <a
            href="https://wa.me/254112272061?text=Hello!%20I%20would%20like%20a%20free%20insurance%20quote%20from%20Barnabas%20Insurance%20Brokers."
            target="_blank"
            rel="noopener noreferrer"
          >
            message us on WhatsApp
          </a>{" "}
          or call +254 112 272 061 and we will take your details directly. (Set
          NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY to enable the checkbox fallback.)
        </span>
      </div>
    );
  }

  return (
    <div className="b-captcha-slot">
      <div ref={container} />
      <p className="b-captcha-note mb-0">
        Please confirm you are a person. This check appears when our automated verification cannot
        be certain, and it protects our clients from spam submissions.
      </p>
    </div>
  );
}
