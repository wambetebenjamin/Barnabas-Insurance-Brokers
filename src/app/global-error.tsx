"use client";

/**
 * Global error boundary: the last resort when the root layout itself fails.
 *
 * It has to render its own <html> and <body>, and it deliberately uses inline
 * styles only, because the stylesheets loaded in the root layout may be exactly
 * what failed. The copy is the same 500 message required by the brief.
 */
import { SITE } from "@/lib/site";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-KE">
      <body
        style={{
          margin: 0,
          fontFamily: "Roboto, system-ui, sans-serif",
          background: "#F6F7FC",
          color: "#15233C",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <main
          style={{
            background: "#fff",
            border: "1px solid #E4E7EF",
            borderRadius: 10,
            maxWidth: 640,
            width: "100%",
            padding: 32,
            boxShadow: "0 0 45px rgba(0,0,0,.07)",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: "#015FC9" }}>
            500
          </p>
          <h1 style={{ fontFamily: "Poppins, sans-serif", fontSize: 24, margin: "10px 0 12px" }}>
            Our systems are temporarily unavailable.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "#696E77", marginBottom: 20 }}>
            Your data and policies are safe. Nothing about your cover has changed, and no personal
            detail has been lost. Try again in a moment, or contact us directly and we will help you
            straight away.
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              background: "#015FC9",
              color: "#fff",
              border: 0,
              borderRadius: 6,
              padding: "14px 22px",
              fontSize: 16,
              cursor: "pointer",
              minHeight: 48,
            }}
          >
            Try Again
          </button>

          <dl style={{ marginTop: 26, fontSize: 15, lineHeight: 1.7 }}>
            <dt style={{ color: "#7C8290", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Broker desk
            </dt>
            <dd style={{ margin: "2px 0 12px", fontWeight: 500 }}>
              <a href={SITE.phoneHref} style={{ color: "#015FC9" }}>
                {SITE.phone}
              </a>
            </dd>
            <dt style={{ color: "#7C8290", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              WhatsApp support
            </dt>
            <dd style={{ margin: "2px 0 12px", fontWeight: 500 }}>
              <a
                href={`https://wa.me/${SITE.whatsappNumber}`}
                style={{ color: "#015FC9" }}
                rel="noopener noreferrer"
              >
                {SITE.phone}
              </a>
            </dd>
            <dt style={{ color: "#7C8290", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              IRA Kenya broker number
            </dt>
            <dd style={{ margin: "2px 0 0", fontWeight: 500 }}>Licence No: {SITE.iraLicenseNumber}</dd>
          </dl>

          {error.digest ? (
            <p style={{ fontSize: 11, color: "#7C8290", marginTop: 18 }}>
              Support reference: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
