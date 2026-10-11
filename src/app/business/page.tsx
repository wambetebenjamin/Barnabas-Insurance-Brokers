/**
 * Corporate and group schemes (brief section 8).
 *
 * Group medical schemes for employers, business liability, fire and burglary,
 * directors and officers liability, marine and cargo, and the enquiry form that
 * posts to /api/group.
 */
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { PageHeader } from "@/components/PageHeader";
import { GroupForm } from "@/components/GroupForm";
import { Reveal } from "@/components/Reveal";
import { buildMetadata, breadcrumbSchema, faqSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { imageAlt, imageSrc } from "@/data/images";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Business and Group Insurance Kenya | Staff Medical Schemes | Barnabas",
  description:
    "Group medical schemes, group life, WIBA employer liability, fire, burglary, public liability, marine cargo, and directors and officers liability for Kenyan employers.",
  path: "/business",
});

const SOLUTIONS = [
  {
    icon: "bi-hospital",
    title: "Group medical schemes",
    body: "Inpatient, outpatient, maternity, dental, optical, and chronic care for your staff, arranged on salary bands with a single renewal date. Pre-authorisation is handled by our office, not your HR team.",
    points: ["Cover from five employees", "Staff communication pack included", "Chronic conditions negotiated in writing"],
  },
  {
    icon: "bi-shield-exclamation",
    title: "Business liability",
    body: "Public liability, employer’s liability and Work Injury Benefits Act cover, and directors and officers liability for the people who make the decisions.",
    points: ["WIBA certificates for tenders", "D&O for tendering and corporate governance", "Claims defended on your behalf"],
  },
  {
    icon: "bi-fire",
    title: "Fire, burglary and property",
    body: "Buildings, stock, machinery, and business interruption, with the sum insured reviewed at every renewal so the average clause does not bite when you claim.",
    points: ["Declared values reviewed annually", "Loss adjuster attended with you", "Business interruption for lost profit"],
  },
  {
    icon: "bi-box-seam",
    title: "Marine and cargo",
    body: "Imports and exports covered warehouse to warehouse, per shipment for the occasional importer or on an open cover for regular trade lanes.",
    points: ["Cover from supplier warehouse to yours", "Open cover for regular importers", "Single shipment certificates"],
  },
];

const FAQS = [
  {
    q: "How many employees do we need for a group scheme?",
    a: "Group rates generally begin at five employees. Smaller teams can be placed on an affinity scheme, and we will tell you which option prices better.",
  },
  {
    q: "Do you handle staff communication and onboarding?",
    a: "Yes. We produce the member guide, run the staff briefing, and give your HR team a named contact for authorisations and additions.",
  },
  {
    q: "Can you take over mid-term from another broker?",
    a: "We can take over at your renewal without a break in cover, and often quote mid-term if the current scheme is due for review.",
  },
  {
    q: "What do you need from us to quote?",
    a: "The staff list with ages and dependants, the cover you want, and your current scheme documents if you have them. Our team can work from a payroll extract.",
  },
];

export default function BusinessPage() {
  return (
    <>
      <PageHeader
        title="Business and Group Schemes"
        intro="Insurance designed around how your business actually operates, with one renewal date and a broker who answers the phone."
        crumbs={[{ name: "Business", href: "/business" }]}
      >
        <div className="d-flex flex-wrap gap-2 mt-4">
          <a href="#group-enquiry" className="btn btn-secondary">
            Send a group scheme enquiry
          </a>
          <a
            className="btn btn-outline-light"
            href={whatsappLink("Hello Barnabas Insurance Brokers. I would like a group scheme quotation for my company.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-whatsapp me-2" aria-hidden="true" />
            WhatsApp the corporate desk
          </a>
        </div>
      </PageHeader>

      <section className="b-section">
        <div className="container">
          <span className="b-eyebrow">What we arrange</span>
          <h2 className="display-6 mb-3">Four ways we protect Kenyan employers</h2>
          <div className="b-rule" />
          <div className="b-grid-2">
            {SOLUTIONS.map((solution, index) => (
              <Reveal key={solution.title} animation="fadeInUp" delay={index * 0.08}>
                <div className="b-policy h-100">
                  <div
                    className="mb-3"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "var(--b-surface-alt)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--b-primary)",
                      fontSize: 20,
                    }}
                  >
                    <i className={`bi ${solution.icon}`} aria-hidden="true" />
                  </div>
                  <h3>{solution.title}</h3>
                  <p className="b-fs-body-sm">{solution.body}</p>
                  <ul className="b-prose" style={{ paddingLeft: 20, fontSize: "var(--b-fs-body-sm)", marginBottom: 0 }}>
                    {solution.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="b-section b-section--alt">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <span className="b-eyebrow">Why employers move to us</span>
              <h2 className="display-6 mb-3">Your staff should not be chasing authorisations</h2>
              <div className="b-rule" />
              <div className="b-prose">
                <p>
                  The complaint we hear most from HR teams is not the premium. It is the admission
                  request that takes three days, or the member who pays cash at a hospital that the
                  scheme does not settle with directly.
                </p>
                <p>
                  We design the scheme around the hospitals your staff actually use, put the
                  authorisation process in our own office, and review declared values annually so that
                  a claim at renewal is not reduced by under-insurance.
                </p>
                <p className="mb-0">
                  We are licensed by the IRA Kenya under licence {SITE.iraLicenseNumber} and are a
                  member of the Association of Kenya Insurers, {SITE.akiMemberNumber}. Your scheme is
                  placed with a regulated insurer, and we remain accountable to you for the advice and
                  the servicing.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="b-hero__media" style={{ aspectRatio: "4 / 3.2" }}>
                <Image
                  src={imageSrc("eastAfricanOfficeMeeting")}
                  alt={imageAlt("eastAfricanOfficeMeeting")}
                  fill
                  sizes="(max-width: 991px) 100vw, 46vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="b-section" id="enquiry">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-5">
              <span className="b-eyebrow">Corporate desk</span>
              <h2 className="display-6 mb-3">Speak to a corporate broker</h2>
              <div className="b-rule" />
              <p className="b-lead">
                Tell us the shape of your business and we will bring options, not a brochure. Every
                enquiry gets a written proposal with the insurer comparison behind it.
              </p>
              <dl className="b-kv">
                <dt>Corporate desk</dt>
                <dd>
                  <a href={SITE.phoneHref} style={{ color: "var(--b-primary)" }}>
                    {SITE.phone}
                  </a>
                </dd>
                <dt>WhatsApp</dt>
                <dd>
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" style={{ color: "var(--b-primary)" }}>
                    Message the corporate desk
                  </a>
                </dd>
                <dt>Email</dt>
                <dd>
                  <a href={SITE.emailHref} style={{ color: "var(--b-primary)" }}>
                    {SITE.email}
                  </a>
                </dd>
                <dt>Office</dt>
                <dd>{SITE.address}</dd>
              </dl>
              <div className="b-cta-band">
                <h2 className="mb-2" style={{ fontSize: 22 }}>
                  Compare group medical schemes
                </h2>
                <p className="mb-3" style={{ fontSize: "var(--b-fs-body-sm)" }}>
                  See indicative group rates and inpatient limits before you speak to us.
                </p>
                <Link href="/compare?product=health-and-medical" className="btn btn-secondary">
                  Open the comparison tool
                </Link>
              </div>
            </div>

            <div className="col-lg-7">
              <GroupForm />
            </div>
          </div>
        </div>
      </section>

      <section className="b-section b-section--alt">
        <div className="container">
          <h2 className="display-6 mb-3">Questions employers ask us</h2>
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
          { name: "Business", path: "/business" },
        ])}
      />
    </>
  );
}
