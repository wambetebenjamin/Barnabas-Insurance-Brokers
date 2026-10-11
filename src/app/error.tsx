"use client";

/**
 * 500 (brief section 17).
 *
 * Copy exactly as specified: "Our systems are temporarily unavailable. Your data
 * and policies are safe." with a Try Again button, the IRA Kenya broker number
 * displayed, and the WhatsApp support number shown.
 *
 * This is the route level error boundary, so the shared chrome (regulatory bar,
 * navbar, footer, floating controls) is still rendered around it.
 */
import Link from "next/link";
import { useEffect } from "react";
import { SITE, whatsappLink } from "@/lib/site";
import { Shield } from "@/components/Brand";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logged so the broker team and our hosting provider can trace it. The
    // message never contains client data.
    console.error("[500]", error.message, error.digest ?? "");
  }, [error]);

  return (
    <>
      <header className="b-pageheader">
        <div className="container">
          <nav aria-label="Breadcrumb">
            <ol className="b-crumbs">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <span aria-current="page">Service unavailable</span>
              </li>
            </ol>
          </nav>
          <h1>500</h1>
          <p>Our systems are temporarily unavailable. Your data and policies are safe.</p>
        </div>
      </header>

      <section className="b-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-7">
              <h2 className="h3 mb-3">What happened</h2>
              <p className="b-lead">
                Something on our side failed while loading this page. Nothing has changed about your
                cover: your policies sit with your insurer exactly as before, and no claim, payment, or
                personal detail has been lost.
              </p>

              <div className="d-flex flex-wrap gap-2 mb-4">
                <button type="button" className="btn btn-primary" onClick={reset}>
                  <i className="bi bi-arrow-clockwise me-2" aria-hidden="true" />
                  Try Again
                </button>
                <Link href="/" className="btn b-btn-ghost">
                  Return to Homepage
                </Link>
                <Link href="/contact" className="btn b-btn-ghost">
                  Contact us
                </Link>
              </div>

              {error.digest ? (
                <p className="b-meta" style={{ color: "var(--b-ink-muted)" }}>
                  Reference for our support team: <strong>{error.digest}</strong>. Quote this if you
                  call us about this page.
                </p>
              ) : null}

              <div className="b-policy">
                <h2 style={{ fontSize: 18 }}>
                  <Shield size={20} className="b-shield me-2" />
                  If you were in the middle of a claim or a payment
                </h2>
                <p className="b-fs-body-sm mb-0">
                  Do not submit a second time straight away. Call or WhatsApp the numbers on this page,
                  tell us what you were doing, and we will tell you whether the submission reached us.
                  We never ask for a payment to be repeated without telling you why.
                </p>
              </div>
            </div>

            <aside className="col-lg-5">
              <div className="b-emergency">
                <h3>
                  <i className="bi bi-telephone-fill me-2" aria-hidden="true" />
                  Speak to us now
                </h3>
                <div className="b-emergency__row" style={{ borderTop: "none", paddingTop: 4 }}>
                  <i className="bi bi-telephone-fill" aria-hidden="true" />
                  <span>
                    <strong>Broker desk, working hours</strong>
                    <span>
                      <a href={SITE.phoneHref}>{SITE.phone}</a>
                    </span>
                  </span>
                </div>
                <div className="b-emergency__row">
                  <i className="fab fa-whatsapp" aria-hidden="true" />
                  <span>
                    <strong>WhatsApp support number</strong>
                    <span>
                      <a href={whatsappLink("Hello Barnabas Insurance Brokers. The website showed an error and I need help.")} target="_blank" rel="noopener noreferrer">
                        {SITE.phone}
                      </a>
                    </span>
                  </span>
                </div>
                <div className="b-emergency__row">
                  <i className="bi bi-envelope-fill" aria-hidden="true" />
                  <span>
                    <strong>Email</strong>
                    <span>
                      <a href={SITE.emailHref}>{SITE.email}</a>
                    </span>
                  </span>
                </div>
                <div className="b-emergency__row">
                  <i className="bi bi-shield-check" aria-hidden="true" />
                  <span>
                    <strong>IRA Kenya broker number</strong>
                    <span>Licence No: {SITE.iraLicenseNumber}</span>
                  </span>
                </div>
                <div className="b-emergency__row" style={{ borderBottom: "none" }}>
                  <i className="bi bi-patch-check" aria-hidden="true" />
                  <span>
                    <strong>Member of AKI</strong>
                    <span>{SITE.akiMemberNumber}</span>
                  </span>
                </div>
              </div>

              <p className="b-legal-note" style={{ marginTop: 20 }}>
                If this keeps happening, email us a screenshot and the time it happened. That is usually
                enough for us to find the cause in our logs within a day.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
