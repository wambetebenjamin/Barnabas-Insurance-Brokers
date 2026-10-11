/**
 * Claims support (brief section 9).
 *
 * A step-by-step guide per product, the emergency claims contacts clearly shown,
 * and the online claim notification form that uploads documents to Vercel Blob and
 * notifies the broker team through /api/claim.
 */
import Link from "next/link";
import type { Metadata } from "next";

import { PageHeader } from "@/components/PageHeader";
import { ClaimForm } from "@/components/ClaimForm";
import { buildMetadata, breadcrumbSchema, faqSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { SITE, whatsappLink } from "@/lib/site";
import { PRODUCTS } from "@/data/products";

export const metadata: Metadata = buildMetadata({
  title: "Claims Support Kenya | Notify a Claim Online | Barnabas Insurance Brokers",
  description:
    "How to claim on your insurance in Kenya, product by product, with the documents each insurer needs. Notify a claim online and our claims team opens it with your insurer the same working day.",
  path: "/claims",
});

const EMERGENCY_ROWS = [
  {
    icon: "bi-telephone-fill",
    title: "Claims line, 24 hours",
    detail: "Any accident, theft, or hospital admission",
    value: SITE.phone,
    href: `tel:${SITE.phone}`,
  },
  {
    icon: "bi-truck",
    title: "Emergency roadside and towing",
    detail: "Contact your insurer’s rescue line on your certificate, then call us",
    value: SITE.phone,
    href: `tel:${SITE.phone}`,
  },
  {
    icon: "fas fa-whatsapp",
    title: "WhatsApp photographs and documents",
    detail: "The fastest way to get the police abstract to us",
    value: "Open WhatsApp",
    href: whatsappLink("Hello Barnabas Insurance Brokers. I need to notify a claim."),
  },
  {
    icon: "bi-envelope-fill",
    title: "Claims email",
    detail: "For documents you prefer to email",
    value: `claims@${SITE.email.split("@")[1]}`,
    href: `mailto:claims@${SITE.email.split("@")[1]}`,
  },
];

const GENERAL_STEPS = [
  {
    title: "Notify us immediately, within 48 hours where possible",
    body: "Call, WhatsApp, or use the form on this page. Late notification is itself a reason for an insurer to reduce or decline a claim, so do not wait until you have every document.",
  },
  {
    title: "Preserve the evidence",
    body: "Photograph everything before it moves or is repaired. Do not dispose of damaged property before the insurer’s assessor has seen it.",
  },
  {
    title: "Obtain the police abstract where it applies",
    body: "Required for motor accidents involving injury or a third party, theft, burglary, and fraud. The insurer cannot settle without it.",
  },
  {
    title: "We open the claim with the insurer the same working day",
    body: "You receive the claim reference, the document checklist for that insurer, and the name of the person at our office handling it.",
  },
  {
    title: "We follow the assessment to settlement",
    body: "We check the assessor’s report, challenge figures that do not add up, and escalate to the insurer’s claims committee and, where needed, to the IRA complaints process.",
  },
];

const FAQS = [
  {
    q: "How long does a claim take in Kenya?",
    a: "A straightforward motor or medical claim is usually settled in two to six weeks. Property and business interruption claims take longer because they involve a loss adjuster and proof of loss.",
  },
  {
    q: "The insurer says my claim is declined. What now?",
    a: "Send it to us. We will review the position against the policy wording, raise a formal appeal with the insurer, and take the matter to the IRA complaints process if the decision does not stand up.",
  },
  {
    q: "Can I repair my car before the assessor sees it?",
    a: "Only emergency work to prevent further damage. Repairs started before assessment are commonly declined, so photograph the damage and call us first.",
  },
  {
    q: "Do I need to pay the excess up front?",
    a: "Usually the excess is deducted from the settlement or paid to the garage. On cash settlements the insurer pays the assessed amount less your excess.",
  },
];

export default function ClaimsPage() {
  return (
    <>
      <PageHeader
        title="Claims Support"
        intro="Tell us what happened and we take it from there: the documents, the assessor, the insurer, and the follow up until your money or your repair is settled."
        crumbs={[{ name: "Claims", href: "/claims" }]}
      >
        <div className="d-flex flex-wrap gap-2 mt-4">
          <a href="#notify" className="btn btn-secondary">
            Notify a claim online
          </a>
          <a className="btn btn-outline-light" href={`tel:${SITE.phone}`}>
            <i className="bi bi-telephone me-2" aria-hidden="true" />
            Call {SITE.phone}
          </a>
        </div>
      </PageHeader>

      <section className="b-section b-section--tight">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-7">
              <h2 className="h3 mb-3">Emergency claims contacts</h2>
              <p className="b-fs-body-sm">
                If anybody is injured, call the emergency services first. Then contact us, and we will
                start the claim while the details are fresh.
              </p>
            </div>
            <div className="col-lg-5">
              <div className="b-emergency">
                {EMERGENCY_ROWS.map((row, index) => (
                  <div
                    className="b-emergency__row"
                    key={row.title}
                    style={index === 0 ? { borderTop: "none", paddingTop: 0 } : undefined}
                  >
                    <i className={row.icon.startsWith("fas") ? "fab fa-whatsapp" : row.icon} aria-hidden="true" />
                    <span>
                      <strong>{row.title}</strong>
                      <span>{row.detail}</span>
                      <span>
                        <a href={row.href} target={row.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                          {row.value}
                        </a>
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="b-section b-section--alt">
        <div className="container">
          <h2 className="display-6 mb-3">How to make a claim</h2>
          <div className="b-rule" />
          <div className="row g-5">
            <div className="col-lg-7">
              <ol className="b-steps-list">
                {GENERAL_STEPS.map((step, index) => (
                  <li key={step.title}>
                    <h3>
                      Step {index + 1}: {step.title}
                    </h3>
                    <p>{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="col-lg-5">
              <div className="b-policy">
                <h3>Documents that settle most claims</h3>
                <ul className="b-prose" style={{ paddingLeft: 20, fontSize: "var(--b-fs-body-sm)" }}>
                  <li>Completed claim form, signed</li>
                  <li>Policy number and copy of the schedule</li>
                  <li>Police abstract where applicable</li>
                  <li>Photographs of the damage or loss</li>
                  <li>Invoices, receipts, and repair estimates</li>
                  <li>Medical reports and hospital bills</li>
                  <li>Death certificate and burial permit for life claims</li>
                  <li>Your ID and, for motor, the driver’s licence and logbook</li>
                </ul>
                <p className="b-legal-note mb-0">
                  We prepare the file with you and submit it complete. An incomplete file is the
                  single biggest cause of delay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="b-section">
        <div className="container">
          <h2 className="display-6 mb-3">Claiming, product by product</h2>
          <div className="b-rule" />
          <div className="b-grid-3">
            {PRODUCTS.map((product) => (
              <div className="b-policy" key={product.slug}>
                <h3>{product.name}</h3>
                <ol className="b-prose" style={{ paddingLeft: 20, fontSize: "var(--b-fs-body-sm)" }}>
                  {product.claims.slice(0, 3).map((step) => (
                    <li key={step.title}>{step.title}</li>
                  ))}
                </ol>
                <Link href={`/products/${product.slug}#how-claims-heading`} className="b-card__link">
                  Full {product.name.toLowerCase()} claim guide
                  <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="b-section b-section--alt" id="notify">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-5">
              <span className="b-eyebrow">Online claim notification</span>
              <h2 className="display-6 mb-3">Notify a claim now</h2>
              <div className="b-rule" />
              <p className="b-lead">
                Complete the form and upload what you have. Our claims team opens the claim with your
                insurer today and sends you the document checklist for that insurer.
              </p>
              <p className="b-legal-note">
                Barnabas Insurance Brokers advises and places cover. The insurer pays claims. We act
                for you in the claim, and we escalate to the IRA complaints process if an insurer
                fails to respond within the timelines set by the Authority.
              </p>
              <div className="b-policy">
                <h3>Download the claim forms</h3>
                <p className="b-fs-body-sm">
                  Prefer to complete the insurer’s own form first? Ask us for the current version and
                  we will send it the same day.
                </p>
                <a className="btn b-btn-ghost" href={whatsappLink("Hello Barnabas Insurance Brokers. Please send me the claim form.")} target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-whatsapp me-2" aria-hidden="true" />
                  Request the claim form
                </a>
              </div>
            </div>
            <div className="col-lg-7">
              <ClaimForm />
            </div>
          </div>
        </div>
      </section>

      <section className="b-section">
        <div className="container">
          <h2 className="display-6 mb-3">Claims questions we are asked</h2>
          <div className="b-rule" />
          <div className="row g-4">
            {FAQS.map((faq) => (
              <div className="col-lg-6" key={faq.q}>
                <div className="b-policy">
                  <h3>{faq.q}</h3>
                  <p className="b-fs-body-sm mb-0">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <JsonLd data={faqSchema(FAQS)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Claims", path: "/claims" },
        ])}
      />
    </>
  );
}
