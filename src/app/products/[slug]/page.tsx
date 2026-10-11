/**
 * Product detail page (brief section 5).
 *
 * Full explanation of the product, what is covered, what is excluded, how claims
 * work, why you need it, a comparison table of the top insurers for that product,
 * and a Get a Quote call to action that opens the quotation form with the product
 * preselected.
 *
 * Rendering: ISR with revalidate = 3600 (brief: "Products and guides: ISR revalidate
 * 3600"). Both the FinancialProduct schema and the FAQ schema are emitted.
 */
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PRODUCTS, productBySlug } from "@/data/products";
import { imageAlt, imageSrc, type ImageSlotKey } from "@/data/images";
import { SITE, whatsappLink } from "@/lib/site";
import { buildMetadata, productSchema, faqSchema, breadcrumbSchema } from "@/lib/seo";
import { getComparisonRows, CYCLE_LABEL } from "@/lib/comparison";
import { formatKes } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { ComparisonTool } from "@/components/ComparisonTool";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 3600;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return buildMetadata({ title: "Product not found", description: "", path: "/products" });

  const slot = product.imageSlot as ImageSlotKey;

  return buildMetadata({
    title: product.metaTitle,
    description: product.metaDescription,
    path: `/products/${product.slug}`,
    image: imageSrc(slot),
    type: "article",
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const slot = product.imageSlot as ImageSlotKey;
  const comparison = await getComparisonRows(product.slug);

  const related = PRODUCTS.filter((item) => item.slug !== product.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        title={product.name}
        intro={product.hero}
        crumbs={[{ name: "Insurance products", href: "/products" }]}
      />

      <section className="b-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-7">
              <span className="b-eyebrow">Overview</span>
              <h2 className="display-6 mb-3">What {product.name.toLowerCase()} does for you</h2>
              <div className="b-rule" />
              <div className="b-prose">
                {product.overview.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="col-lg-5">
              <div className="b-card">
                <div className="b-card__media" style={{ aspectRatio: "16 / 10" }}>
                  <Image
                    src={imageSrc(slot)}
                    alt={imageAlt(slot)}
                    fill
                    priority
                    sizes="(max-width: 991px) 100vw, 40vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="b-card__body">
                  <h3>Indicative cover from {formatKes(product.fromKes)}</h3>
                  <p className="b-card__benefit mb-2">{product.fromUnit}, subject to underwriting.</p>
                  <p className="b-card__who">
                    <strong>Best for:</strong> {product.whoFor}
                  </p>
                  <div className="d-grid gap-2">
                    <Link href={`/quote?product=${product.slug}`} className="btn btn-primary">
                      Get a Quote for {product.name.split(" ")[0]} Cover
                    </Link>
                    <a
                      className="btn b-btn-ghost"
                      href={whatsappLink(
                        `Hello Barnabas Insurance Brokers. I would like ${product.name.toLowerCase()} explained and quoted.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-whatsapp me-2" aria-hidden="true" />
                      Ask a broker first
                    </a>
                  </div>
                  <p className="b-legal-note mb-0" style={{ marginTop: 16 }}>
                    Barnabas Insurance Brokers advises and places cover. The insurer pays claims.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Covered and excluded */}
      <section className="b-section b-section--alt" aria-labelledby="covered-heading">
        <div className="container">
          <h2 id="covered-heading" className="display-6 mb-3">
            What is covered, and what is not
          </h2>
          <div className="b-rule" />
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="b-policy h-100">
                <h3>
                  <i className="bi bi-check-circle-fill me-2" style={{ color: "#1E7A4B" }} aria-hidden="true" />
                  Typically covered
                </h3>
                <ul className="b-prose" style={{ paddingLeft: 20, marginBottom: 0, fontSize: "var(--b-fs-body-sm)" }}>
                  {product.covered.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="b-policy h-100">
                <h3>
                  <i className="bi bi-x-circle-fill me-2" style={{ color: "#A5281B" }} aria-hidden="true" />
                  Typically excluded
                </h3>
                <ul className="b-prose" style={{ paddingLeft: 20, marginBottom: 0, fontSize: "var(--b-fs-body-sm)" }}>
                  {product.excluded.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <p className="b-legal-note">
            Every insurer’s wording differs. The list above reflects how these covers are normally
            written in Kenya. Before you buy, we give you the insurer’s own policy document and walk
            you through the exclusions that apply to your risk.
          </p>
        </div>
      </section>

      {/* Why you need it */}
      <section className="b-section" aria-labelledby="why-need-heading">
        <div className="container">
          <h2 id="why-need-heading" className="display-6 mb-3">
            Why clients buy this cover
          </h2>
          <div className="b-rule" />
          <div className="b-grid-3">
            {product.whyYouNeed.map((reason) => (
              <div className="b-policy" key={reason.title}>
                <h3>{reason.title}</h3>
                <p className="b-fs-body-sm mb-0">{reason.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claims */}
      <section className="b-section b-section--alt" aria-labelledby="how-claims-heading">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-5">
              <h2 id="how-claims-heading" className="display-6 mb-3">
                How a {product.name.toLowerCase()} claim works
              </h2>
              <div className="b-rule" />
              <p className="b-lead">
                These are the steps we follow with you, in order. Nothing here requires you to argue
                with an insurer on your own.
              </p>
              <div className="d-flex flex-wrap gap-2 mt-3">
                <Link href="/claims" className="btn btn-primary">
                  Claims help centre
                </Link>
                <a className="btn b-btn-ghost" href={`tel:${SITE.phone}`}>
                  <i className="bi bi-telephone me-2" aria-hidden="true" />
                  {SITE.phone}
                </a>
              </div>
            </div>
            <div className="col-lg-7">
              <ol className="b-steps-list">
                {product.claims.map((step, index) => (
                  <li key={step.title}>
                    <h3>
                      Step {index + 1}: {step.title}
                    </h3>
                    <p>{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="b-section" aria-labelledby="insurers-heading">
        <div className="container">
          <h2 id="insurers-heading" className="display-6 mb-3">
            Top insurers compared for {product.name.toLowerCase()}
          </h2>
          <div className="b-rule" />
          <p className="b-lead mb-5">
            {comparison.rows.length} insurers we place this cover with, and what they typically offer
            for the profile below. Indicative figures only, confirmed in writing by the insurer.
          </p>

          <div className="b-table-wrap" tabIndex={0} role="region" aria-label={`${product.name} insurer comparison`}>
            <table className="b-compare">
              <caption>
                {product.name} comparison. {comparison.profile}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Insurer and plan</th>
                  <th scope="col">Premium</th>
                  <th scope="col">Coverage limit</th>
                  <th scope="col">Excess</th>
                  <th scope="col">Key benefits</th>
                  <th scope="col">
                    <span className="b-visually-hidden">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={`${row.insurer}-${row.plan}`}>
                    <th scope="row">
                      {row.insurer}
                      <br />
                      <span style={{ fontWeight: 400, color: "var(--b-ink)" }}>{row.plan}</span>
                      {row.highlight ? <span className="b-compare__best">Broker pick</span> : null}
                    </th>
                    <td>
                      <span className="b-premium">
                        {formatKes(row.premiumFrom)} to {formatKes(row.premiumTo)}
                      </span>
                      <br />
                      <span className="b-meta" style={{ color: "var(--b-ink-muted)" }}>
                        {CYCLE_LABEL[row.cycle]}
                      </span>
                    </td>
                    <td>{row.coverageLimit}</td>
                    <td>{row.excess}</td>
                    <td>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {row.benefits.map((benefit) => (
                          <li key={benefit} style={{ marginBottom: 6 }}>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <Link
                        href={`/quote?product=${product.slug}&insurer=${encodeURIComponent(row.insurer)}`}
                        className="btn btn-primary"
                        style={{ minHeight: 44, whiteSpace: "nowrap" }}
                      >
                        Get This Plan
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="b-scroll-hint">Scroll sideways to see every column.</p>
          <p className="b-legal-note">{comparison.disclaimer}</p>

          <div className="b-cta-band mt-4">
            <h2 className="mb-2">Ready for a real quote?</h2>
            <p className="mb-3">
              Two minutes of questions and a licensed broker will come back within 24 hours with
              options from the insurers above.
            </p>
            <Link href={`/quote?product=${product.slug}`} className="btn btn-secondary">
              Get a Free Quote
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="b-section b-section--alt" aria-labelledby="faq-heading">
        <div className="container">
          <h2 id="faq-heading" className="display-6 mb-3">
            {product.name} questions we are asked weekly
          </h2>
          <div className="b-rule" />
          <div className="row g-4">
            {product.faqs.map((faq) => (
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

      {/* Related */}
      <section className="b-section" aria-labelledby="related-heading">
        <div className="container">
          <h2 id="related-heading" className="h3 mb-4">
            Other covers clients pair with this one
          </h2>
          <div className="b-grid-3">
            {related.map((item) => (
              <div className="b-policy" key={item.slug}>
                <h3>{item.name}</h3>
                <p className="b-fs-body-sm">{item.benefit}</p>
                <Link href={`/products/${item.slug}`} className="btn b-btn-ghost">
                  Read about {item.name.split(" ")[0].toLowerCase()}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <JsonLd data={productSchema(product)} />
      <JsonLd data={faqSchema(product.faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Insurance products", path: "/products" },
          { name: product.name, path: `/products/${product.slug}` },
        ])}
      />
    </>
  );
}
