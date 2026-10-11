/**
 * About (brief section 2 navigation).
 *
 * Uses the design source’s own team card pattern (.team-item, image scale on
 * hover, .team-text sliding up) for the broker team, and the source’s facts
 * styling for the numbers.
 */
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { PageHeader } from "@/components/PageHeader";
import { RegulatorBadge, Shield } from "@/components/Brand";
import { FactsCounter } from "@/components/FactsCounter";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { imageAlt, imageSrc } from "@/data/images";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "About Barnabas Insurance Brokers | IRA Licensed Brokers in Nairobi",
  description:
    "An independent Kenyan insurance brokerage: how we work, who advises you, our licence with the IRA, and our membership of the Association of Kenya Insurers.",
  path: "/about",
});

const TEAM = [
  {
    name: "Barnabas M.",
    role: "Principal broker",
    blurb: "Places commercial and corporate risks, and signs off every scheme we recommend.",
    image: "/img/team-1.jpg",
  },
  {
    name: "Faith N.",
    role: "Head of medical schemes",
    blurb: "Designs group medical schemes and runs pre-authorisation for employer clients.",
    image: "/img/team-2.jpg",
  },
  {
    name: "Kevin O.",
    role: "Claims manager",
    blurb: "Handles motor and property claims, assessors, and IRA escalations.",
    image: "/img/team-3.jpg",
  },
  {
    name: "Sarah W.",
    role: "Personal lines broker",
    blurb: "Motor, home, travel, and life cover for individuals and families.",
    image: "/img/team-4.jpg",
  },
];

const VALUES = [
  {
    icon: "bi-eye",
    title: "We disclose how we are paid",
    body: "Insurers pay us commission from the premium. Before you place cover we tell you what that means for the options we present, and we tell you when a cheaper insurer pays us less.",
  },
  {
    icon: "bi-chat-left-text",
    title: "Plain language, in writing",
    body: "The exclusions matter more than the brochure. Every recommendation we make includes the exclusions in writing, in words a client can act on.",
  },
  {
    icon: "bi-arrow-repeat",
    title: "We review at renewal",
    body: "Sums insured drift out of date and premiums drift up. We review declared values and re-quote the market at every renewal rather than letting a policy roll over.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Us"
        intro="An independent insurance brokerage in Nairobi, licensed by the IRA Kenya, working for clients in all 47 counties."
        crumbs={[{ name: "About", href: "/about" }]}
      />

      <section className="b-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-7">
              <span className="b-eyebrow">Who we are</span>
              <h2 className="display-6 mb-3">
                Independent advice, Kenyan risk, one accountable broker
              </h2>
              <div className="b-rule" />
              <div className="b-prose">
                <p>
                  {SITE.name} is an independent insurance brokerage based in Nairobi. We are not owned
                  by an insurer and we do not sell a single company’s products, which means the advice
                  you get is shaped by your risk and your budget rather than by which insurer pays the
                  highest commission.
                </p>
                <p>
                  We work with individuals, families, SMEs, corporates, vehicle owners, homeowners, and
                  employers setting up staff medical schemes. Most of our growth comes from clients
                  telling other clients, which only happens when claims are handled properly.
                </p>
                <p>
                  Our licence from the Insurance Regulatory Authority of Kenya is{" "}
                  <strong>{SITE.iraLicenseNumber}</strong>, and we are a member of the Association of
                  Kenya Insurers, <strong>{SITE.akiMemberNumber}</strong>. Insurance broking in Kenya
                  is regulated by the Insurance Act and the IRA, and we are bound by the conduct rules
                  that come with that licence, including the duty to place the client’s interest
                  first.
                </p>
                <p className="mb-0">
                  Barnabas Insurance Brokers advises and places cover. The insurer pays claims. We
                  stay with you through the claim, and where an insurer does not respond within the
                  timelines the IRA sets, we escalate.
                </p>
              </div>

              <div className="b-footer__badges" style={{ marginTop: 24 }}>
                <RegulatorBadge />
              </div>
            </div>

            <div className="col-lg-5">
              <div className="b-hero__media" style={{ aspectRatio: "4 / 3.4" }}>
                <Image
                  src={imageSrc("nairobiBusinessOffice")}
                  alt={imageAlt("nairobiBusinessOffice")}
                  fill
                  priority
                  sizes="(max-width: 991px) 100vw, 40vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="b-policy" style={{ marginTop: 20 }}>
                <h2 style={{ fontSize: 18 }}>
                  <Shield size={20} className="b-shield me-2" />
                  What we do not do
                </h2>
                <ul className="b-prose" style={{ paddingLeft: 20, fontSize: "var(--b-fs-body-sm)", marginBottom: 0 }}>
                  <li>We do not pay claims, the insurer does.</li>
                  <li>We do not guarantee an insurer’s decision.</li>
                  <li>We do not ask for your M-PESA PIN, password, or card details.</li>
                  <li>We do not sell client data to third parties.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FactsCounter />

      <section className="b-section" aria-labelledby="team-heading">
        <div className="container">
          <span className="b-eyebrow">The team</span>
          <h2 id="team-heading" className="display-6 mb-3">
            People who answer the phone
          </h2>
          <div className="b-rule" />
          <p className="b-lead mb-5">
            Every client has a named broker. The person who arranged your cover is the person who
            handles it when something goes wrong.
          </p>

          <div className="row g-4">
            {TEAM.map((member) => (
              <div className="col-lg-3 col-md-6" key={member.name}>
                <div className="team-item rounded overflow-hidden">
                  <div style={{ position: "relative", aspectRatio: "3 / 4", background: "var(--b-hairline)" }}>
                    <Image
                      src={member.image}
                      alt={`${member.name}, ${member.role} at Barnabas Insurance Brokers`}
                      fill
                      sizes="(max-width: 767px) 50vw, 25vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 style={{ fontSize: 18 }}>{member.name}</h3>
                    <p className="b-meta mb-2" style={{ color: "var(--b-primary)" }}>
                      {member.role}
                    </p>
                    <p className="b-fs-body-sm mb-0">{member.blurb}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="b-section b-section--alt">
        <div className="container">
          <h2 className="display-6 mb-3">How we work</h2>
          <div className="b-rule" />
          <div className="b-grid-3">
            {VALUES.map((value) => (
              <div className="b-policy" key={value.title}>
                <div
                  className="mb-3"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#fff",
                    border: "1px solid var(--b-hairline)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--b-primary)",
                    fontSize: 20,
                  }}
                >
                  <i className={`bi ${value.icon}`} aria-hidden="true" />
                </div>
                <h3>{value.title}</h3>
                <p className="b-fs-body-sm mb-0">{value.body}</p>
              </div>
            ))}
          </div>
          <div className="b-cta-band" style={{ marginTop: 32 }}>
            <h2 className="mb-2">Work with a broker who answers</h2>
            <p className="mb-3">
              Get a free comparative quote, or tell us what you are worried about and we will tell you
              what it is worth insuring.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link href="/quote" className="btn btn-secondary">
                Get a Free Quote
              </Link>
              <Link href="/careers" className="btn btn-outline-light">
                Careers at Barnabas
              </Link>
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
    </>
  );
}
