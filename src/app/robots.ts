/**
 * robots.txt.
 *
 * The client portal, the private API routes, and the static copies of the original
 * template pages are disallowed. Everything else is open.
 */
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/portal",
          "/portal/",
          "/api/",
          "/design-reference/",
          "/styleguide",
          "/_next/",
          "/.data/",
        ],
      },
      {
        // Scrapers that ignore terms of use: keep the comparison dataset and the
        // contact details off their indexes.
        userAgent: ["AhrefsBot", "SemrushBot", "MJ12bot", "DotBot"],
        disallow: "/",
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
