/**
 * Hero (brief section 3).
 *
 * Split layout: copy and CTAs on the left, an East African family or professional
 * photograph on the right. The headline enters word by word, which is done with
 * one span per word carrying an index, so the animation is driven by CSS and
 * survives having no JavaScript.
 *
 * Headline and subtext are used exactly as the brief specifies, with no em dashes.
 */
import Image from "next/image";
import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/site";
import { imageAlt, imageSrc } from "@/data/images";
import { Shield } from "@/components/Brand";
import { formatNumber } from "@/lib/format";

const HEADLINE = ["The", "Right", "Cover.", "The", "Right", "Price.", "Every", "Time."];
const ACCENT = new Set(["Cover.", "Price."]);

const TRUST = [
  { icon: "bi-shield-check", title: "IRA Licensed", copy: `Licence ${SITE.iraLicenseNumber}` },
  { icon: "bi-award", title: `${SITE.yearsExperience} years experience`, copy: "Serving Kenyan clients since 2005" },
  { icon: "bi-people", title: `${formatNumber(SITE.clientsProtected)} clients protected`, copy: "Individuals, families, and employers" },
  { icon: "bi-patch-check", title: "AKI member", copy: SITE.akiMemberNumber },
];

export function Hero() {
  return (
    <section className="b-hero" aria-labelledby="hero-heading">
      <div className="container b-hero__inner">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span className="b-hero__eyebrow">
              <Shield size={16} />
              Independent brokers, Nairobi
            </span>

            <h1 id="hero-heading">
              {HEADLINE.map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className={`b-word ${ACCENT.has(word) ? "b-word--accent" : ""}`}
                  style={{ ["--b-i" as string]: index }}
                >
                  {word}
                  {index < HEADLINE.length - 1 ? "\u00A0" : ""}
                </span>
              ))}
            </h1>

            <p className="b-hero__sub">
              Independent insurance brokers. We compare all major insurers in Kenya so you do not have
              to.
            </p>

            <div className="b-hero__ctas">
              <Link href="/quote" className="btn btn-primary">
                <i className="bi bi-file-earmark-text" aria-hidden="true" />
                Get a Free Quote
              </Link>
              <Link href="/compare" className="btn btn-outline-primary">
                <i className="bi bi-columns-gap" aria-hidden="true" />
                Compare Plans
              </Link>
              <a
                className="btn btn-link"
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ minHeight: 52, display: "inline-flex", alignItems: "center", gap: 10 }}
              >
                <i className="fab fa-whatsapp" aria-hidden="true" />
                WhatsApp a broker
              </a>
            </div>

            <div className="b-trust">
              {TRUST.map((item) => (
                <div className="b-trust__item" key={item.title}>
                  <i className={`bi ${item.icon}`} aria-hidden="true" />
                  <span>
                    <strong>{item.title}</strong>
                    <span>{item.copy}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="b-hero__media">
              <Image
                src={imageSrc("heroFamily")}
                alt={imageAlt("heroFamily")}
                fill
                priority
                sizes="(max-width: 991px) 100vw, 46vw"
                style={{ objectFit: "cover" }}
              />
              <div className="b-hero__media-badge">
                <i className="bi bi-clock-history" style={{ fontSize: 22, color: "var(--b-primary)" }} aria-hidden="true" />
                <span>
                  <strong>Quotes in 24 hours</strong>
                  <span>A licensed broker, not a call centre</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
