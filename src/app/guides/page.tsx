/**
 * Blog and guides index (brief section 11). ISR at 3600 seconds.
 */
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { getAllGuides } from "@/lib/guides";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { formatDate } from "@/lib/format";
import { PRODUCTS } from "@/data/products";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Insurance Guides for Kenya | Medical, Motor, Life and Claims | Barnabas",
  description:
    "Practical guides written by Kenyan insurance brokers: choosing medical cover, motor insurance explained, life insurance myths, and what to do after an accident.",
  path: "/guides",
});

const PLACEHOLDER_IMAGES = ["/img/carousel-1.jpg", "/img/carousel-2.jpg", "/img/about.jpg", "/img/feature.jpg"];

export default async function GuidesPage() {
  const guides = await getAllGuides();

  return (
    <>
      <PageHeader
        title="Guides and Articles"
        intro="Written by our brokers for Kenyan clients. No sales pitch, just what the policy wording actually says and what to do about it."
        crumbs={[{ name: "Guides", href: "/guides" }]}
      />

      <section className="b-section">
        <div className="container">
          {guides.length === 0 ? (
            <p className="b-lead">
              Our guides are being published. In the meantime, call {""}
              <a href="tel:+254112272061">+254 112 272 061</a> and a broker will answer your question
              directly.
            </p>
          ) : (
            <div className="b-grid-3">
              {guides.map((guide, index) => {
                const product = PRODUCTS.find((item) => item.slug === guide.relatedProduct);
                return (
                  <Reveal key={guide.slug} animation="fadeInUp" delay={index * 0.08}>
                    <article className="b-card">
                      <div className="b-card__media">
                        <Image
                          src={guide.image ?? PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]}
                          alt=""
                          fill
                          sizes="(max-width: 991px) 100vw, 33vw"
                          style={{ objectFit: "cover" }}
                        />
                        <span className="b-card__tag">{guide.category}</span>
                      </div>
                      <div className="b-card__body">
                        <h2 style={{ fontSize: 19 }}>
                          <Link href={`/guides/${guide.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                            {guide.title}
                          </Link>
                        </h2>
                        <p className="b-card__benefit">{guide.description}</p>
                        <p className="b-meta mb-3" style={{ color: "var(--b-ink-muted)" }}>
                          {formatDate(guide.publishedAt)} &middot; {guide.readingMinutes} minute read
                          {product ? ` \u00b7 ${product.name}` : ""}
                        </p>
                        <div className="b-card__foot">
                          <Link href={`/guides/${guide.slug}`} className="btn btn-primary">
                            Read the guide
                          </Link>
                          {product ? (
                            <Link href={`/products/${product.slug}`} className="b-card__link">
                              {product.name}
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}

          <div className="b-cta-band" style={{ marginTop: 40 }}>
            <h2 className="mb-2">Have a question the guides do not answer?</h2>
            <p className="mb-3">
              Ask a licensed broker. We answer specific questions about Kenyan policies every day, and
              we do not charge for the answer.
            </p>
            <Link href="/contact" className="btn btn-secondary">
              Ask a broker
            </Link>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ])}
      />
    </>
  );
}
