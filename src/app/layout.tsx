/**
 * Root layout.
 *
 * The <head> reproduces the design source’s asset order exactly (INVENTORY.md
 * section 3): Google Fonts for Roboto and Poppins, Font Awesome 5.10.0, Bootstrap
 * Icons 1.4.1, the archive’s animate.css and Owl Carousel stylesheets, then the
 * archive’s own compiled bootstrap.min.css and style.css, and finally the additive
 * layer in globals.css. Nothing is re-derived and nothing is reordered.
 *
 * Every page carries the regulatory bar and the shared chrome: sticky navbar,
 * footer, loading screen, cookie banner, voice tour, WhatsApp button, back to top.
 */
import type { Metadata, Viewport } from "next";
import "./globals.css";

import { SITE } from "@/lib/site";
import { buildMetadata, insuranceAgencySchema } from "@/lib/seo";
import { RegulatoryBar } from "@/components/RegulatoryBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { CookieConsent } from "@/components/CookieConsent";
import { VoiceTour } from "@/components/VoiceTour";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BackToTop } from "@/components/BackToTop";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  ...buildMetadata({
    title: `${SITE.name} | IRA Licensed Insurance Brokers in Kenya`,
    description: SITE.description,
    path: "/",
    keywords: [
      "insurance brokers Kenya",
      "insurance broker Nairobi",
      "motor insurance Kenya",
      "health insurance Kenya",
      "life insurance Kenya",
      "group medical scheme Kenya",
      "IRA licensed broker",
    ],
  }),
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.legalName,
  formatDetection: { telephone: true, address: true, email: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  other: {
    "theme-color": "#015FC9",
    "ira-kenya-licence": SITE.iraLicenseNumber,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#015FC9",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&family=Poppins:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css"
          rel="stylesheet"
        />
        <link href="/lib/animate/animate.min.css" rel="stylesheet" />
        <link href="/lib/owlcarousel/assets/owl.carousel.min.css" rel="stylesheet" />
        <link href="/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/css/style.css" rel="stylesheet" />
      </head>
      <body>
        <a className="b-skip-link" href="#main">
          Skip to main content
        </a>

        <LoadingScreen />

        <RegulatoryBar />
        <Navbar />

        <main id="main">{children}</main>

        <Footer />

        <VoiceTour />
        <WhatsAppButton />
        <BackToTop />
        <CookieConsent />

        <JsonLd data={insuranceAgencySchema()} />
      </body>
    </html>
  );
}
