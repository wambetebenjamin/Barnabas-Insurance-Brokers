/**
 * Insurance comparison tool (brief section 7). ISR at 3600 seconds, matching the
 * products and guides, so a rate correction from the broker team appears within
 * the hour at the latest and often immediately.
 */
import type { Metadata } from "next";

import { ComparisonTool } from "@/components/ComparisonTool";
import { PageHeader } from "@/components/PageHeader";
import { buildMetadata, breadcrumbSchema, faqSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { getComparison } from "@/lib/comparison";
import { PRODUCTS, type ProductSlug } from "@/data/products";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Compare Insurance in Kenya | Premiums, Limits and Excess | Barnabas",
  description:
    "Compare insurance cover in Kenya side by side: monthly premiums, coverage limits, excesses, and key benefits from the insurers we place cover with.",
  path: "/compare",
});

const FAQS = [
  {
    q: "Are these premiums the price I will pay?",
    a: "They are indicative figures for the profile shown. Your exact premium is confirmed by the insurer after underwriting, and we give it to you in writing before you commit.",
  },
  {
    q: "Why do some insurers not appear?",
    a: "We list the insurers who actively write that class of business for clients like you. If there is an insurer you want included, tell us and we will approach them.",
  },
  {
    q: "Can you beat the cheapest quote I already have?",
    a: "Sometimes, and sometimes the cheapest quote is cheapest for a reason: a higher excess, a narrower hospital list, or a longer waiting period. We compare terms, not only price.",
  },
  {
    q: "How do you get paid?",
    a: "The insurer pays us commission from the premium. Our advice costs you nothing extra, and we disclose the arrangement before you place cover.",
  },
];

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  const comparison = await getComparison();
  const initialProduct = PRODUCTS.some((item) => item.slug === product)
    ? (product as ProductSlug)
    : undefined;

  const rows = Object.values(comparison.products).reduce((total, list) => total + list.length, 0);

  return (
    <>
      <PageHeader
        title="Compare Insurance Plans"
        intro={`${rows} plans across ${Object.keys(comparison.products).length} products, compared side by side. Pick up to three insurers and get an exact quote.`}
        crumbs={[{ name: "Compare plans", href: "/compare" }]}
      />

      <section className="b-section">
        <div className="container">
          <ComparisonTool
            products={comparison.products}
            profiles={comparison.profiles}
            disclaimer={comparison.disclaimer}
            updatedAt={comparison.updatedAt}
            adjusted={comparison.adjustedByBrokerTeam}
            initialProduct={initialProduct}
          />
        </div>
      </section>

      <section className="b-section b-section--alt">
        <div className="container">
          <h2 className="display-6 mb-3">How to read a comparison table</h2>
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
          <p className="b-legal-note" style={{ marginTop: 24 }}>
            {comparison.maintainedBy}
          </p>
        </div>
      </section>

      <JsonLd data={faqSchema(FAQS)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Compare plans", path: "/compare" },
        ])}
      />
    </>
  );
}
