/**
 * Careers (brief section 2 navigation).
 */
import Link from "next/link";
import type { Metadata } from "next";

import { PageHeader } from "@/components/PageHeader";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Careers at Barnabas Insurance Brokers | Insurance Jobs in Nairobi",
  description:
    "Join an independent IRA licensed Kenyan brokerage. Openings for insurance sales executives, medical scheme administrators, claims officers, and interns in Nairobi.",
  path: "/careers",
});

const OPENINGS = [
  {
    title: "Insurance sales executive, personal lines",
    type: "Full time, Nairobi",
    requirements: [
      "Two or more years selling insurance in Kenya, with a track record you can evidence",
      "Certificate of Proficiency in Insurance, or willing to sit it with our support",
      "Confident explaining exclusions, not just premiums",
      "Clean reference from a previous employer or principal",
    ],
  },
  {
    title: "Medical scheme administrator",
    type: "Full time, Nairobi",
    requirements: [
      "Experience handling pre-authorisation and claims with Kenyan medical insurers",
      "Knowledge of hospital networks and scheme benefit structures",
      "Strong written English and Kiswahili for member communication",
      "Calm under pressure during peak admission periods",
    ],
  },
  {
    title: "Claims officer, motor and property",
    type: "Full time, Nairobi",
    requirements: [
      "Experience with assessors, garages, and loss adjusters in Kenya",
      "Ability to read a policy wording and challenge a declined claim",
      "Full driving licence",
      "Attention to detail on the police abstract and document trail",
    ],
  },
  {
    title: "Brokerage intern",
    type: "Six month internship, Nairobi",
    requirements: [
      "Recent graduate in insurance, business, or a related field",
      "Willingness to learn underwriting, placement, and claims from the ground up",
      "Good numeracy and clear written English",
    ],
  },
];

const HOW_TO_APPLY = [
  "Send your CV and a short covering note to our careers inbox, quoting the role in the subject line.",
  "Tell us one situation where you protected a client from a bad decision, if you have one. We read those answers first.",
  "Shortlisted candidates meet the principal broker and complete a short written exercise based on a real Kenyan policy wording.",
  "We respond to every applicant, including the ones we do not shortlist.",
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        title="Careers"
        intro="We are a small brokerage that competes on advice and service. If you would rather be trusted than scripted, we would like to hear from you."
        crumbs={[{ name: "Careers", href: "/careers" }]}
      />

      <section className="b-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-7">
              <h2 className="display-6 mb-3">Current openings</h2>
              <div className="b-rule" />
              <div className="d-grid gap-4">
                {OPENINGS.map((opening) => (
                  <div className="b-policy" key={opening.title}>
                    <div className="b-policy__top">
                      <div>
                        <h3>{opening.title}</h3>
                        <p className="b-meta mb-0" style={{ color: "var(--b-ink-muted)" }}>
                          {opening.type}
                        </p>
                      </div>
                      <span className="b-pill b-pill--active">Open</span>
                    </div>
                    <ul className="b-prose" style={{ paddingLeft: 20, fontSize: "var(--b-fs-body-sm)", marginTop: 14, marginBottom: 16 }}>
                      {opening.requirements.map((requirement) => (
                        <li key={requirement}>{requirement}</li>
                      ))}
                    </ul>
                    <a
                      className="btn btn-primary"
                      href={`mailto:careers@${SITE.email.split("@")[1]}?subject=${encodeURIComponent(`Application: ${opening.title}`)}`}
                    >
                      Apply for this role
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <aside className="col-lg-5">
              <div className="b-policy">
                <h2 style={{ fontSize: 19 }}>How to apply</h2>
                <ol className="b-prose" style={{ paddingLeft: 20, fontSize: "var(--b-fs-body-sm)" }}>
                  {HOW_TO_APPLY.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="b-policy" style={{ marginTop: 22 }}>
                <h2 style={{ fontSize: 19 }}>Send your application</h2>
                <p className="b-fs-body-sm">
                  Email <a href={`mailto:careers@${SITE.email.split("@")[1]}`}>careers@{SITE.email.split("@")[1]}</a>,
                  or WhatsApp us your CV. We do not charge for applications, and no genuine employer
                  ever should.
                </p>
                <div className="d-grid gap-2">
                  <a className="btn btn-primary" href={`mailto:careers@${SITE.email.split("@")[1]}`}>
                    <i className="bi bi-envelope me-2" aria-hidden="true" />
                    Email your CV
                  </a>
                  <a
                    className="btn b-btn-ghost"
                    href={whatsappLink("Hello Barnabas Insurance Brokers. I would like to apply for a role.")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-whatsapp me-2" aria-hidden="true" />
                    WhatsApp your CV
                  </a>
                </div>
                <p className="b-legal-note mb-0" style={{ marginTop: 16 }}>
                  Applications are stored only for recruitment and are deleted within twelve months
                  unless you ask us to keep them, in line with the Kenya Data Protection Act 2019.
                </p>
              </div>

              <div className="b-policy" style={{ marginTop: 22 }}>
                <h2 style={{ fontSize: 19 }}>Protect yourself from recruitment fraud</h2>
                <p className="b-fs-body-sm mb-0">
                  We never ask for payment at any stage of recruitment, and we only interview at our
                  Nairobi office or by video call arranged from our official contacts. If anybody asks
                  you for money using our name, report it to us immediately.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Careers", path: "/careers" },
        ])}
      />
    </>
  );
}
