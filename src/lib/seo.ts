/**
 * Metadata and structured data.
 *
 * Schema types required by the brief: InsuranceAgency and LocalBusiness on the
 * site, FinancialProduct on every product page, plus FAQPage and Article where
 * they apply. Every schema carries the IRA Kenya licence number and the AKI
 * membership, because that is the regulatory information a Kenyan client is
 * entitled to see.
 */
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import type { Product } from "@/data/products";

const ORIGIN = SITE.url;

export const absoluteUrl = (path = "/"): string =>
  `${ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;

interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  /** Open Graph image path, resolved against the site origin. */
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export function buildMetadata({
  title,
  description,
  path,
  image = "/img/carousel-1.jpg",
  type = "website",
  publishedTime,
  noIndex = false,
  keywords,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: "en_KE",
      type,
      publishedTime,
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

/* --------------------------------------------------------------- schema */

const address = {
  "@type": "PostalAddress",
  streetAddress: SITE.address,
  addressLocality: "Nairobi",
  addressRegion: "Nairobi County",
  postalCode: "00100",
  addressCountry: "KE",
};

const geo = { "@type": "GeoCoordinates", latitude: -1.286389, longitude: 36.817223 };

const openingHours = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "17:00",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Saturday"],
    opens: "09:00",
    closes: "13:00",
  },
];

const shared = () => ({
  "@id": `${ORIGIN}/#organisation`,
  name: SITE.name,
  legalName: SITE.legalName,
  url: ORIGIN,
  telephone: SITE.phone,
  email: SITE.email,
  description: SITE.description,
  address,
  geo,
  openingHoursSpecification: openingHours,
  areaServed: { "@type": "Country", name: "Kenya" },
  currenciesAccepted: "KES",
  priceRange: "KES",
  foundingDate: String(SITE.founded),
  image: absoluteUrl("/img/carousel-1.jpg"),
  logo: absoluteUrl("/icon.svg"),
  sameAs: [SITE.social.facebook, SITE.social.x, SITE.social.linkedin, SITE.social.instagram],
  identifier: `IRA Kenya broker licence ${SITE.iraLicenseNumber}`,
  knowsAbout: [
    "motor insurance",
    "health insurance",
    "life insurance",
    "home insurance",
    "business insurance",
    "travel insurance",
    "group medical schemes",
  ],
});

/** InsuranceAgency + LocalBusiness on one graph node, as the brief requires both. */
export const insuranceAgencySchema = () => ({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": ["InsuranceAgency", "LocalBusiness"], ...shared() },
    {
      "@type": "WebSite",
      "@id": `${ORIGIN}/#website`,
      url: ORIGIN,
      name: SITE.name,
      inLanguage: "en-KE",
      publisher: { "@id": `${ORIGIN}/#organisation` },
    },
  ],
});

export const productSchema = (product: Product) => ({
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  name: `${product.name} in Kenya`,
  description: product.metaDescription,
  url: absoluteUrl(`/products/${product.slug}`),
  category: product.name,
  provider: { "@id": `${ORIGIN}/#organisation` },
  areaServed: { "@type": "Country", name: "Kenya" },
  offers: {
    "@type": "Offer",
    priceCurrency: "KES",
    price: product.fromKes,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: product.fromKes,
      priceCurrency: "KES",
      unitText: product.fromUnit,
      valueAddedTaxIncluded: false,
    },
    availability: "https://schema.org/InStock",
    url: absoluteUrl(`/quote?product=${product.slug}`),
    description:
      "Indicative starting premium. The final premium is confirmed by the insurer after underwriting.",
  },
});

export const faqSchema = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
});

export const articleSchema = (input: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  author?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: input.title,
  description: input.description,
  datePublished: input.publishedAt,
  dateModified: input.updatedAt ?? input.publishedAt,
  author: { "@type": input.author ? "Person" : "Organization", name: input.author ?? SITE.name },
  publisher: { "@id": `${ORIGIN}/#organisation` },
  mainEntityOfPage: absoluteUrl(`/guides/${input.slug}`),
  image: absoluteUrl(input.image ?? "/img/carousel-1.jpg"),
  inLanguage: "en-KE",
});

export const breadcrumbSchema = (trail: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

/** Rendered as a JSON-LD script tag in a server component. */
export const jsonLd = (data: unknown): string => JSON.stringify(data);
