/**
 * Site-wide configuration: identity, navigation, contact details.
 *
 * Values come from the environment (src/lib/env.ts) so that the two placeholders
 * flagged in INVENTORY.md section 14 - the IRA Kenya licence number and the
 * office address - can be corrected in the Vercel dashboard without a code change.
 */
import { publicEnv } from "@/lib/env";

export const SITE = {
  name: "Barnabas Insurance Brokers",
  shortName: "Barnabas Insurance",
  legalName: "Barnabas Insurance Brokers Limited",
  tagline: "Independent insurance brokers in Kenya",
  description:
    "Barnabas Insurance Brokers is an IRA Kenya licensed independent insurance brokerage in Nairobi. We compare motor, health, life, property, business and travel cover from all major Kenyan insurers so you get the right cover at the best price.",
  url: publicEnv.siteUrl,
  iraLicenseNumber: publicEnv.iraLicenseNumber,
  akiMemberNumber: publicEnv.akiMemberNumber,
  phone: publicEnv.brokerPhone,
  phoneHref: `tel:${publicEnv.brokerPhone.replace(/\s+/g, "")}`,
  email: publicEnv.brokerEmail,
  emailHref: `mailto:${publicEnv.brokerEmail}`,
  whatsappNumber: publicEnv.whatsappNumber,
  address: publicEnv.officeAddress,
  hours: publicEnv.officeHours,
  mapsEmbed: publicEnv.mapsEmbed,
  pexelsAttribution: publicEnv.pexelsAttribution,
  founded: 2005,
  yearsExperience: 20,
  clientsProtected: 50000,
  claimsSettled: 12000,
  insurersCompared: 25,
  social: {
    facebook: "https://www.facebook.com/",
    x: "https://x.com/",
    linkedin: "https://www.linkedin.com/",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
  },
} as const;

/** The single WhatsApp deep link the brief specifies, plus its default text. */
export const WHATSAPP_DEFAULT_MESSAGE =
  "Hello! I would like a free insurance quote from Barnabas Insurance Brokers.";

export const whatsappLink = (message: string = WHATSAPP_DEFAULT_MESSAGE): string =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;

/** Main navigation - brief section 2, exactly these seven items plus the CTA. */
export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Personal Insurance", href: "/products?audience=personal" },
  { label: "Business Insurance", href: "/business" },
  { label: "Claims", href: "/claims" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_PRODUCTS = [
  { label: "Motor Insurance", href: "/products/motor-insurance" },
  { label: "Health and Medical", href: "/products/health-and-medical" },
  { label: "Life Insurance", href: "/products/life-insurance" },
  { label: "Home and Property", href: "/products/home-and-property" },
  { label: "Business Insurance", href: "/products/business-insurance" },
  { label: "Travel Insurance", href: "/products/travel-insurance" },
] as const;

export const FOOTER_SERVICES = [
  { label: "Get a Free Quote", href: "/quote" },
  { label: "Compare Insurers", href: "/compare" },
  { label: "Group Medical Schemes", href: "/business" },
  { label: "Claims Support", href: "/claims" },
  { label: "Client Portal", href: "/portal" },
  { label: "Insurance Guides", href: "/guides" },
] as const;

export const FOOTER_LEGAL = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Cookie Policy", href: "/legal/cookie-policy" },
] as const;

export const FOOTER_COMPANY = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact Us", href: "/contact" },
  { label: "Claims", href: "/claims" },
] as const;

/** The 47 counties of Kenya, for the county selector in step 3 of the quote. */
export const COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa",
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos",
  "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang’a",
  "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu",
  "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi", "Trans Nzoia", "Turkana",
  "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
] as const;

export type County = (typeof COUNTIES)[number];
