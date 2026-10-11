/**
 * Client portal (brief section 10).
 *
 * Rendering: SSR only, auth required, no caching (brief: "Client portal: SSR only.
 * Auth required. No caching."). The page is also blocked at the edge by
 * middleware.ts, so an unauthenticated request never reaches this component.
 */
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { PortalDashboard } from "@/components/PortalDashboard";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Client Portal | Barnabas Insurance Brokers",
  description:
    "View your active policies, renewal dates and premiums, download your policy schedule, notify a claim, and message your broker.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function PortalPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/portal/login?next=/portal");
  }

  return (
    <>
      <PageHeader
        title="Client Portal"
        intro="Your active policies, renewal dates, premiums, documents, and a direct line to your broker."
        crumbs={[]}
      />

      <section className="b-section">
        <div className="container">
          <div className="b-alert b-alert--info" style={{ marginBottom: 24 }}>
            <i className="bi bi-shield-lock" aria-hidden="true" />
            <span>
              Signed in as <strong>{session.user.email}</strong>. This area shows financial information,
              so it is never cached and never indexed. Sensitive documents are generated on demand and
              are not stored in your browser.
            </span>
          </div>

          <PortalDashboard />

          <p className="b-legal-note" style={{ marginTop: 32 }}>
            Barnabas Insurance Brokers advises and places cover. The insurer pays claims. Documents in
            this portal are convenience copies: the insurer’s own schedule and policy document govern
            the contract of insurance. If any detail here differs from your insurer’s schedule, tell us
            immediately on {SITE.phone}. Licensed by IRA Kenya, licence {SITE.iraLicenseNumber}.
          </p>
        </div>
      </section>
    </>
  );
}
