/**
 * Guide detail (brief section 11). MDX rendered on the server through
 * next-mdx-remote/rsc, so no MDX runtime ships to the browser. ISR at 3600 seconds.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { PageHeader } from "@/components/PageHeader";
import { getAllGuides, getGuide, getGuideSlugs } from "@/lib/guides";
import { buildMetadata, articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { formatDate } from "@/lib/format";
import { PRODUCTS } from "@/data/products";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getGuideSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) {
    return buildMetadata({ title: "Guide not found", description: "", path: "/guides", noIndex: true });
  }
  return buildMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    image: guide.image ?? "/img/carousel-1.jpg",
    type: "article",
    publishedTime: guide.publishedAt,
    keywords: guide.keywords,
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  const { content } = await compileMDX({
    source: guide.body,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  const product = PRODUCTS.find((item) => item.slug === guide.relatedProduct);
  const others = (await getAllGuides()).filter((item) => item.slug !== guide.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        title={guide.title}
        intro={guide.description}
        crumbs={[{ name: "Guides", href: "/guides" }]}
      >
        <p className="b-meta" style={{ color: "rgba(255,255,255,.85)", marginTop: 14 }}>
          {formatDate(guide.publishedAt)}
          {guide.updatedAt && guide.updatedAt !== guide.publishedAt
            ? `, updated ${formatDate(guide.updatedAt)}`
            : ""}{" "}
          &middot; {guide.readingMinutes} minute read &middot; {guide.author}
        </p>
      </PageHeader>

      <section className="b-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-8">
              <article className="b-prose">{content}</article>

              <div className="b-legal-note" style={{ marginTop: 32 }}>
                This guide is general information about insurance in Kenya, not advice on your
                specific policy. Cover is subject to the terms, conditions, and exclusions of the
                insurer that issues it. {SITE.name} advises and places cover, and the insurer pays
                claims. Read your policy document, and call us if anything in it is unclear. Licence
                number with the IRA Kenya: {SITE.iraLicenseNumber}.
              </div>

              <div className="b-cta-band" style={{ marginTop: 28 }}>
                <h2 className="mb-2">Get a quote based on this guide</h2>
                <p className="mb-3">
                  A licensed broker will compare insurers for your exact situation and reply within 24
                  hours.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Link href={product ? `/quote?product=${product.slug}` : "/quote"} className="btn btn-secondary">
                    Get a Free Quote
                  </Link>
                  <Link href="/compare" className="btn b-btn-ghost">
                    Compare insurers
                  </Link>
                </div>
              </div>
            </div>

            <aside className="col-lg-4">
              {product ? (
                <div className="b-card" style={{ marginBottom: 24 }}>
                  <div className="b-card__body">
                    <span className="b-eyebrow">Related cover</span>
                    <h2 style={{ fontSize: 19 }}>{product.name}</h2>
                    <p className="b-card__benefit">{product.benefit}</p>
                    <div className="d-grid gap-2">
                      <Link href={`/products/${product.slug}`} className="btn btn-primary">
                        Read about {product.name.split(" ")[0].toLowerCase()}
                      </Link>
                      <Link href={`/quote?product=${product.slug}`} className="btn b-btn-ghost">
                        Get a quote
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="b-policy">
                <h2 style={{ fontSize: 18 }}>More guides</h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {others.map((item) => (
                    <li key={item.slug} style={{ marginBottom: 14 }}>
                      <Link href={`/guides/${item.slug}`} style={{ color: "var(--b-dark)", fontWeight: 500 }}>
                        {item.title}
                      </Link>
                      <span className="b-meta" style={{ display: "block", color: "var(--b-ink-muted)" }}>
                        {item.category} &middot; {item.readingMinutes} minute read
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <JsonLd
        data={articleSchema({
          title: guide.title,
          description: guide.description,
          slug: guide.slug,
          publishedAt: guide.publishedAt,
          updatedAt: guide.updatedAt,
          image: guide.image,
          author: guide.author,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: guide.title, path: `/guides/${guide.slug}` },
        ])}
      />
      <JsonLd
        data={faqSchema([
          {
            q: guide.title,
            a: guide.description,
          },
        ])}
      />
    </>
  );
}
