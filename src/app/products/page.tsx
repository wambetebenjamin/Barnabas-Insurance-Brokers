/**
 * Products index. Also the target of the "Personal Insurance" navigation item,
 * which filters to the covers written for individuals, families and vehicle owners.
 */
import Link from "next/link";
import type { Metadata } from "next";

import { PRODUCTS } from "@/data/products";
import { SITE } from "@/lib/site";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Insurance Products in Kenya | Motor, Health, Life, Home, Business, Travel",
  description:
    "All six insurance products we place for clients in Kenya, with what is covered, what is excluded, and indicative premiums. Independent advice from an IRA licensed broker.",
  path: "/products",
});

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string }>;
}) {
  const { audience } = await searchParams;
  const personal = audience === "personal";

  const products = personal
    ? PRODUCTS.filter((product) => product.audience === "personal" || product.audience === "both")
    : PRODUCTS;

  return (
    <>
      <PageHeader
        title={personal ? "Personal Insurance" : "Insurance Products"}
        intro={
          personal
            ? "Cover for you, your family, your vehicle, and your home. Compare all major Kenyan insurers through one broker."
            : "Six covers, every major insurer in Kenya compared, and a licensed broker who stays with you through the claim."
        }
        crumbs={personal ? [] : [{ name: "Insurance products", href: "/products" }]}
      />

      <section className="b-section">
        <div className="container">
          <div className="d-flex flex-wrap gap-2 mb-5">
            <Link
              href="/products"
              className={`btn ${personal ? "b-btn-ghost" : "btn-primary"}`}
              aria-current={personal ? undefined : "page"}
            >
              All products ({PRODUCTS.length})
            </Link>
            <Link
              href="/products?audience=personal"
              className={`btn ${personal ? "btn-primary" : "b-btn-ghost"}`}
              aria-current={personal ? "page" : undefined}
            >
              Personal and family
            </Link>
            <Link href="/business" className="btn b-btn-ghost">
              Business and group schemes
            </Link>
          </div>

          <div className="b-grid-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>

          <div className="b-cta-band mt-5">
            <h2 className="mb-2">Not sure which cover you need?</h2>
            <p className="mb-3">
              Tell us what you are protecting and we will recommend the cover, or tell you honestly
              that you do not need it yet. Our licence number with the IRA is{" "}
              {SITE.iraLicenseNumber}.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link href="/quote" className="btn btn-secondary">
                Get a Free Quote
              </Link>
              <Link href="/compare" className="btn btn-outline-light">
                Compare insurers first
              </Link>
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Insurance products", path: "/products" },
        ])}
      />
    </>
  );
}
