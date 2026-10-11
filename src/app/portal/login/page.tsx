/**
 * Portal sign in (brief sections 10 and backend).
 *
 * Two steps: email address plus policy reference number, then the six digit code
 * we email. The OTP is issued by /api/portal/otp and verified by the NextAuth
 * Credentials provider, so the code is never trusted by the browser.
 */
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/PageHeader";
import { PortalLoginForm } from "@/components/PortalLoginForm";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = buildMetadataLocal();

function buildMetadataLocal(): Metadata {
  return {
    title: "Client Portal Sign In | Barnabas Insurance Brokers",
    description:
      "Sign in to the Barnabas Insurance Brokers client portal with your email address, policy reference, and a one time code.",
    robots: { index: false, follow: false, nocache: true },
    alternates: { canonical: `${SITE.url}/portal/login` },
  };
}

export default function PortalLoginPage() {
  return (
    <>
      <PageHeader
        title="Client Portal Sign In"
        intro="Enter your email address and the policy reference from your schedule. We will email you a six digit code."
        crumbs={[{ name: "Client portal", href: "/portal" }]}
      />

      <section className="b-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6">
              <Suspense fallback={<p className="b-fs-body-sm">Loading the sign in form…</p>}>
                <PortalLoginForm />
              </Suspense>
            </div>

            <aside className="col-lg-6">
              <div className="b-policy">
                <h2 style={{ fontSize: 18 }}>Where to find your policy reference</h2>
                <p className="b-fs-body-sm">
                  It is on the schedule we sent you, and on the reference in every WhatsApp or email we
                  have sent you about the policy. It looks like <strong>BIB-P-250011-A1B2</strong>. Your
                  insurer’s policy number works too.
                </p>
              </div>

              <div className="b-policy" style={{ marginTop: 20 }}>
                <h2 style={{ fontSize: 18 }}>Security</h2>
                <ul className="b-prose" style={{ paddingLeft: 20, fontSize: "var(--b-fs-body-sm)" }}>
                  <li>Codes expire after 10 minutes and can be used once.</li>
                  <li>Five wrong attempts cancel the code.</li>
                  <li>Sessions last eight hours and are protected by an HTTP-only cookie.</li>
                  <li>We will never ask you for the code, your M-PESA PIN, or your password.</li>
                </ul>
              </div>

              <div className="b-policy" style={{ marginTop: 20 }}>
                <h2 style={{ fontSize: 18 }}>Trouble signing in?</h2>
                <p className="b-fs-body-sm mb-0">
                  Call {SITE.phone} or WhatsApp us during {SITE.hours} and a broker will help you in
                  while you are on the phone. We will never ask you to pay for access.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
