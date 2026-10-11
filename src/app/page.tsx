/**
 * Home page (brief sections 1 to 4, 7, 9, 12, 13, 14).
 *
 * Section order: hero, insurance products, facts band, why choose us, comparison
 * teaser, claims support, testimonials, newsletter, contact.
 *
 * The products and guides are the only routes needing ISR; the home page is static
 * with client islands for motion, so it can be served from the edge cache.
 */
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { FactsCounter } from "@/components/FactsCounter";
import { Testimonials } from "@/components/Testimonials";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ComparisonTool } from "@/components/ComparisonTool";
import { Shield } from "@/components/Brand";
import { JsonLd } from "@/components/JsonLd";

import { PRODUCTS } from "@/data/products";
import { imageAlt, imageSrc } from "@/data/images";
import { SITE, whatsappLink } from "@/lib/site";
import { buildMetadata, faqSchema } from "@/lib/seo";
import { getComparison } from "@/lib/comparison";

export const metadata: Metadata = buildMetadata({
  title: `${SITE.name} | IRA Licensed Insurance Brokers in Kenya`,
  description:
    "Independent insurance brokers in Nairobi. Compare motor, health, life, home, business, and travel insurance from all major Kenyan insurers. Free quote in 24 hours.",
  path: "/",
});

const REASONS = [
  {
    icon: "bi-search",
    title: "We compare, we do not sell one brand",
    body: "We are not tied to a single insurer. We place your cover where the terms and the price suit you, and we tell you when the cheapest option is not the right one.",
  },
  {
    icon: "bi-people",
    title: "A named broker, not a call centre",
    body: "You get a licensed broker with a direct line and WhatsApp. The same person who arranged your cover handles your claim.",
  },
  {
    icon: "bi-clipboard2-pulse",
    title: "Claims support end to end",
    body: "We prepare the documents, chase the assessor, and escalate to the insurer and, where needed, to the IRA. Most of our clients never deal with the insurer directly.",
  },
  {
    icon: "bi-shield-check",
    title: "Regulated and accountable",
    body: `Licensed by the Insurance Regulatory Authority of Kenya, licence ${SITE.iraLicenseNumber}, and a member of the Association of Kenya Insurers.`,
  },
];

const CLAIM_STEPS = [
  "Tell us what happened, by phone, WhatsApp, or the claim form on this site.",
  "We open the claim with your insurer the same working day and send you the document checklist.",
  "We follow the assessment, check the figures, and keep you updated until settlement.",
];

const HOME_FAQS = [
  {
    q: "How much does it cost to use a broker?",
    a: "Our advice costs you nothing extra. Commission is paid by the insurer from the premium, and where we negotiate a discount for you, you keep the benefit.",
  },
  {
    q: "How quickly will I get a quotation?",
    a: "Most quotations go out within a few hours and always within 24 hours. Complex group schemes and fleet risks take a little longer because we compare more insurers.",
  },
  {
    q: "Can you handle a claim on a policy I already have?",
    a: "Yes. If you place your renewal with us we can take over the claim, and we regularly intervene for clients even before a renewal is due.",
  },
  {
    q: "Do you cover clients outside Nairobi?",
    a: "Yes. We serve clients in all 47 counties. Medical cover includes county hospital networks and motor claims are assessed wherever the vehicle is.",
  },
];

export default async function HomePage() {
  const comparison = await getComparison("motor-insurance");

  return (
    <>
      <Hero />

      {/* Products */}
      <section className="b-section" id="products" aria-labelledby="products-heading">
        <div className="container">
          <div className="row align-items-end mb-5">
            <div className="col-lg-8">
              <span className="b-eyebrow">Insurance products</span>
              <h2 id="products-heading" className="display-6 mb-3">
                Six covers, one broker, every major insurer compared
              </h2>
              <div className="b-rule" />
              <p className="b-lead mb-0">
                Tell us what you need to protect. We will quote it across the market, explain the
                exclusions in plain language, and place the cover with the insurer whose terms suit
                your risk.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <Link href="/compare" className="btn btn-outline-primary btn-lg">
                <i className="bi bi-columns-gap me-2" aria-hidden="true" />
                Compare all insurers
              </Link>
            </div>
          </div>

          <div className="b-grid-3">
            {PRODUCTS.map((product, index) => (
              <Reveal key={product.slug} animation="fadeInUp" delay={index * 0.08}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FactsCounter />

      {/* Why choose us */}
      <section className="b-section b-section--alt" aria-labelledby="why-heading">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <span className="b-eyebrow">Why clients stay with us</span>
              <h2 id="why-heading" className="display-6 mb-3">
                Independent advice is the whole point
              </h2>
              <div className="b-rule" />
              <div className="b-grid-2" style={{ gap: 20 }}>
                {REASONS.map((reason) => (
                  <div key={reason.title}>
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
                      <i className={`bi ${reason.icon}`} aria-hidden="true" />
                    </div>
                    <h3 style={{ fontSize: 17, marginBottom: 6 }}>{reason.title}</h3>
                    <p className="b-fs-body-sm mb-0">{reason.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="b-hero__media" style={{ aspectRatio: "4 / 3.2" }}>
                <Image
                  src={imageSrc("kenyanProfessionalAgent")}
                  alt={imageAlt("kenyanProfessionalAgent")}
                  fill
                  sizes="(max-width: 991px) 100vw, 46vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="b-cta-band mt-4">
                <h2 className="mb-2">Not sure what you need?</h2>
                <p className="mb-3">
                  Tell us about your family, your business, or your vehicle and we will tell you
                  what is worth insuring and what is not.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Link href="/quote" className="btn btn-secondary">
                    Get a Free Quote
                  </Link>
                  <a
                    className="btn btn-outline-light"
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-whatsapp me-2" aria-hidden="true" />
                    Ask a broker
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison teaser */}
      <section className="b-section" id="compare" aria-labelledby="compare-heading">
        <div className="container">
          <span className="b-eyebrow">Comparison tool</span>
          <h2 id="compare-heading" className="display-6 mb-3">
            Compare insurers side by side
          </h2>
          <div className="b-rule" />
          <p className="b-lead mb-5">
            Indicative premiums, coverage limits, excesses and benefits. Pick up to three insurers,
            then get an exact quote from a broker.
          </p>

          <ComparisonTool
            products={comparison.products}
            profiles={comparison.profiles}
            disclaimer={comparison.disclaimer}
            updatedAt={comparison.updatedAt}
            adjusted={comparison.adjustedByBrokerTeam}
            initialProduct="motor-insurance"
            lockProduct
          />
        </div>
      </section>

      {/* Claims support */}
      <section className="b-section b-section--alt" id="claims" aria-labelledby="claims-heading">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6">
              <span className="b-eyebrow">Claims support</span>
              <h2 id="claims-heading" className="display-6 mb-3">
                When you claim, we work for you
              </h2>
              <div className="b-rule" />
              <ol className="b-steps-list mt-4">
                {CLAIM_STEPS.map((step, index) => (
                  <li key={step}>
                    <h3>Step {index + 1}</h3>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <Link href="/claims" className="btn btn-primary">
                  Claims help and notification
                </Link>
                <a className="btn b-btn-ghost" href={`tel:${SITE.phone}`}>
                  <i className="bi bi-telephone me-2" aria-hidden="true" />
                  {SITE.phone}
                </a>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="b-emergency">
                <h3>
                  <Shield size={22} className="b-shield me-2" />
                  Emergency claims contacts
                </h3>
                <p>
                  If anybody is injured, call the emergency services first. Then call us, day or
                  night, and we will start the claim while the details are fresh.
                </p>
                <div className="b-emergency__row">
                  <i className="bi bi-telephone-fill" aria-hidden="true" />
                  <span>
                    <strong>Claims line, 24 hours</strong>
                    <span>
                      <a href={`tel:${SITE.phone}`}>{SITE.phone}</a>
                    </span>
                  </span>
                </div>
                <div className="b-emergency__row">
                  <i className="fab fa-whatsapp" aria-hidden="true" />
                  <span>
                    <strong>WhatsApp a claim</strong>
                    <span>
                      <a href={whatsappLink("Hello Barnabas Insurance Brokers. I need to notify a claim.")} target="_blank" rel="noopener noreferrer">
                        Send photos and the police abstract
                      </a>
                    </span>
                  </span>
                </div>
                <div className="b-emergency__row">
                  <i className="bi bi-envelope-fill" aria-hidden="true" />
                  <span>
                    <strong>Email the claims team</strong>
                    <span>
                      <a href={`mailto:claims@${SITE.email.split("@")[1]}`}>claims@{SITE.email.split("@")[1]}</a>
                    </span>
                  </span>
                </div>
                <div className="b-emergency__row" style={{ borderBottom: "none" }}>
                  <i className="bi bi-file-earmark-text-fill" aria-hidden="true" />
                  <span>
                    <strong>Online claim notification</strong>
                    <span>
                      <Link href="/claims#notify">Upload documents and notify the claim</Link>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="b-section" id="testimonials" aria-labelledby="testimonials-heading">
        <div className="container">
          <span className="b-eyebrow">Client reviews</span>
          <h2 id="testimonials-heading" className="display-6 mb-3">
            What Kenyan clients say
          </h2>
          <div className="b-rule" />
          <p className="b-lead mb-5">
            Real cover types, real claims. Names are shortened to a first name and initial to protect
            our clients’ privacy.
          </p>
          <Testimonials />
        </div>
      </section>

      {/* Newsletter + contact */}
      <section className="b-section b-section--alt" aria-labelledby="contact-heading">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-5">
              <span className="b-eyebrow">Stay covered</span>
              <h2 id="contact-heading" className="display-6 mb-3">
                Talk to a licensed broker
              </h2>
              <div className="b-rule" />
              <dl className="b-kv">
                <dt>Office</dt>
                <dd>{SITE.address}</dd>
                <dt>Phone</dt>
                <dd>
                  <a href={SITE.phoneHref} style={{ color: "var(--b-primary)" }}>
                    {SITE.phone}
                  </a>
                </dd>
                <dt>WhatsApp</dt>
                <dd>
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--b-primary)" }}
                  >
                    Message the broker desk
                  </a>
                </dd>
                <dt>Email</dt>
                <dd>
                  <a href={SITE.emailHref} style={{ color: "var(--b-primary)" }}>
                    {SITE.email}
                  </a>
                </dd>
                <dt>Hours</dt>
                <dd>{SITE.hours}</dd>
                <dt>Regulator</dt>
                <dd>
                  Licensed by IRA Kenya, licence no: {SITE.iraLicenseNumber}. Member of AKI,{" "}
                  {SITE.akiMemberNumber}.
                </dd>
              </dl>

              <div className="b-card" style={{ boxShadow: "none" }}>
                <div className="b-card__media" style={{ aspectRatio: "16 / 9", position: "relative" }}>
                  <iframe
                    title="Barnabas Insurance Brokers office location in Nairobi"
                    src={SITE.mapsEmbed}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{ border: 0, width: "100%", height: "100%", position: "absolute", inset: 0 }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 18 }}>Insurance tips and renewal reminders for Kenya</h3>
                <p className="b-fs-body-sm">
                  One email a month, written by our brokers. No selling your details, and you can
                  unsubscribe in one click.
                </p>
                <NewsletterForm variant="page" />
              </div>
            </div>

            <div className="col-lg-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <JsonLd data={faqSchema(HOME_FAQS)} />
    </>
  );
}
