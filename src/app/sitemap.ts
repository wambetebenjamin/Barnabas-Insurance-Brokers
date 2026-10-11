/**
 * Dynamic sitemap.
 *
 * Brief: "Dynamic sitemap from public pages only." The portal, the design
 * reference copies of the source template, and every API route are excluded by
 * construction: they are simply never listed here, and the portal additionally
 * sends X-Robots-Tag: noindex from middleware and vercel.json.
 */
import type { MetadataRoute } from "next";

import { PRODUCTS } from "@/data/products";
import { getAllGuides } from "@/lib/guides";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/quote`, lastModified: now, changeFrequency: "monthly", priority: 0.95 },
    { url: `${base}/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/business`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/claims`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/careers`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/legal/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/cookie-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const productPages: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${base}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const guides = await getAllGuides();
  const guidePages: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${base}/guides/${guide.slug}`,
    lastModified: guide.updatedAt ? new Date(guide.updatedAt) : new Date(guide.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...guidePages];
}
