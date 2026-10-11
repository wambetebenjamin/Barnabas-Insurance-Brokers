import type { NextConfig } from "next";

/**
 * Barnabas Insurance Brokers - Next.js configuration.
 *
 * The design source (Insure v1.0.0) is served from /public exactly as it shipped:
 *   /css/bootstrap.min.css  /css/style.css  /js/main.js  /img/**  /lib/**
 * and is linked from <head> in src/app/layout.tsx, so the cascade is identical
 * to the archive. No CSS reset, no Tailwind, no preflight is added.
 *
 * Security headers and HSTS live in vercel.json as specified by the brief.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Pexels is the brief's image source. remotePatterns is pre-wired so that
    // running `npm run fetch-pexels` (or pointing a slot at a Pexels URL) works
    // without a code change.
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com", pathname: "/photos/**" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 390, 640, 768, 1024, 1280, 1440, 1920],
  },
  // The MDX guides are read from disk at build / ISR time; make sure they are
  // traced into the serverless bundle on Vercel.
  outputFileTracingIncludes: {
    "/guides/[slug]": ["./src/content/guides/**/*"],
    "/guides": ["./src/content/guides/**/*"],
    "/api/guides": ["./src/content/guides/**/*"],
  },
  /**
   * The design reference pages are the original template HTML, kept byte for byte
   * so they can be compared against the live site. They reference their assets
   * relatively (`css/style.css`, `img/...`), which would resolve under
   * /design-reference and 404. These rewrites point those folders at the copies in
   * /public, so the comparison pages render with the source styling intact.
   */
  async rewrites() {
    const folders = ["css", "js", "lib", "img"];
    return [
      ...folders.map((folder) => ({
        source: `/design-reference/${folder}/:path*`,
        destination: `/${folder}/:path*`,
      })),
      // The template's own pages link to each other without the folder prefix.
      { source: "/design-reference/index", destination: "/design-reference/index.html" },
    ];
  },
  /**
   * Headers that must hold on any host, not only behind vercel.json: the portal
   * and the design reference copies are never indexed, and the portal is never
   * cached.
   */
  async headers() {
    return [
      {
        source: "/design-reference/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/portal/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/api/portal/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Legacy template routes -> the equivalent Barnabas page, so no inbound
      // link to the old design source 404s.
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/service.html", destination: "/products", permanent: true },
      { source: "/appointment.html", destination: "/quote", permanent: true },
      { source: "/team.html", destination: "/about", permanent: true },
      { source: "/testimonial.html", destination: "/#testimonials", permanent: true },
      { source: "/feature.html", destination: "/#products", permanent: true },
    ];
  },
};

export default nextConfig;
