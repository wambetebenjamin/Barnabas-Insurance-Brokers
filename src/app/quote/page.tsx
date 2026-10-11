/**
 * Quotation request page (brief section 6).
 *
 * Rendering: SSR for freshness (brief: "Quotation form: SSR for freshness"), so the
 * form always reflects the current dataset and never serves a stale build to a
 * client who is about to submit personal data.
 */
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { QuoteForm } from "@/components/QuoteForm";
import { PageHeader } from "@/components/PageHeader";
import { Shield } from "@/components/Brand";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { PRODUCTS, type ProductSlug } from "@/data/products";
import { imageAlt, imageSrc } from "@/data/images";
import { SITE, whatsappLink } from "@/lib/site";
import { formatKes } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = buildMetadata({
  title: "Get a Free Insurance Quote in Kenya | Barnabas Insurance Brokers",
  description:
    "Request a free insurance quotation in Kenya. Motor, health, life, home, business, and travel cover compared across all major insurers. A licensed broker replies within 24 hours.",
  path: "/quote",
});

const PROMISES = [
  "A licensed broker, not an automated comparison site.",
  "Quotes from multiple insurers, with the exclusions explained.",
  "A written quotation you can keep, valid for 30 days.",
  "No obligation, and no cost for our advice.",
];

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; insurer?: string; value?: string; county?: string }>;
}) {
  const { product, insurer } = await searchParams;
  const validProduct = PRODUCTS.some((item) => item.slug === product)
    ? (product as ProductSlug)
    : undefined;

  return (
    <>
      <PageHeader
        title="Get a Free Quote"
        intro="Four short steps. A licensed broker will compare the insurers for your risk and come back to you within 24 hours."
        crumbs={[{ name: "Get a quote", href: "/quote" }]}
      />

      <section className="b-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-8">
              {insurer ? (
                <p className="b-alert b-alert--info" style={{ marginBottom: 20 }}>
                  <i className="bi bi-info-circle" aria-hidden="true" />
                  <span>
                    You chose <strong>{insurer}</strong> in the comparison tool. We will price that
                    plan alongside two or three alternatives so you can see the difference.
                  </span>
                </p>
              ) : null}

              <QuoteForm initialProduct={validProduct} />
            </div>

            <aside className="col-lg-4">
              <div className="b-card" style={{ marginBottom: 24 }}>
                <div className="b-card__media" style={{ aspectRatio: "4 / 3" }}>
                  <Image
                    src={imageSrc("africanWomanSigning")}
                    alt={imageAlt("africanWomanSigning")}
                    fill
                    sizes="(max-width: 991px) 100vw, 32vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="b-card__body">
                  <h2 style={{ fontSize: 19 }}>What you get with a Barnabas quote</h2>
                  <ul className="b-prose" style={{ paddingLeft: 20, fontSize: "var(--b-fs-body-sm)" }}>
                    {PROMISES.map((promise) => (
                      <li key={promise}>{promise}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="b-policy" style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18 }}>
                  <Shield size={20} className="b-shield me-2" />
                  Why we ask for your ID number
                </h2>
                <p className="b-fs-body-sm mb-0">
                  Insurers require it for underwriting, exactly as they do on a proposal form. It is
                  transmitted over HTTPS, stored with your quotation in Vercel KV, and never placed on
                  a public page. We do not sell client data. See the{" "}
                  <Link href="/legal/privacy-policy">Privacy Policy</Link> for how health and personal
                  data are handled under the Kenya Data Protection Act 2019.
                </p>
              </div>

              <div className="b-policy">
                <h2 style={{ fontSize: 18 }}>Prefer to talk?</h2>
                <p className="b-fs-body-sm">
                  Call or WhatsApp a broker during working hours, {SITE.hours}.
                </p>
                <div className="d-grid gap-2">
                  <a className="btn btn-primary" href={SITE.phoneHref}>
                    <i className="bi bi-telephone me-2" aria-hidden="true" />
                    {SITE.phone}
                  </a>
                  <a
                    className="btn b-btn-ghost"
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-whatsapp me-2" aria-hidden="true" />
                    WhatsApp a broker
                  </a>
                </div>
                <p className="b-legal-note mb-0" style={{ marginTop: 16 }}>
                  Indicative premiums start from {formatKes(1500)} for life cover, {formatKes(3500)} per
                  person per month for medical cover, and {formatKes(6500)} per month for comprehensive
                  motor cover. Final premiums are confirmed by the insurer after underwriting.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Get a quote", path: "/quote" },
        ])}
      />
    </>
  );
}
