/**
 * Validation, shared by the browser and the API routes.
 *
 * The client uses these for immediate feedback; the API routes parse with the
 * same schemas as the authoritative check, so a hand-crafted POST cannot get
 * past the server. zod is the only validation dependency (brief stack).
 */
import { z } from "zod";

const kenyanPhone = z
  .string()
  .trim()
  .min(9, "Enter a phone number we can reach you on")
  .max(17, "That phone number is too long")
  .regex(/^(\+?254|0)\s?\d{2}\s?\d{3}\s?\d{3,4}$/, "Enter a Kenyan number, for example 0712 345 678");

const email = z.email("Enter a valid email address").max(160);

const personName = z
  .string()
  .trim()
  .min(2, "Enter your full name")
  .max(120, "That name is too long");

const kenyanId = z
  .string()
  .trim()
  .min(5, "Enter your ID or passport number")
  .max(20, "That ID number is too long")
  .regex(/^(\d{7,8}|[A-Za-z]{1,2}\d{6,8})$/, "Enter a valid Kenyan ID or passport number");

const county = z.string().trim().min(2, "Select your county").max(40);

const captcha = {
  captchaToken: z.string().max(4096).optional(),
  captchaVersion: z.enum(["v3", "v2"]).optional(),
};

/* ------------------------------------------------ product specific details */

const currentYear = new Date().getFullYear();

export const QUOTE_DETAIL_SCHEMAS = {
  "motor-insurance": z.object({
    registrationNumber: z.string().trim().min(4, "Enter the vehicle registration number").max(12),
    make: z.string().trim().min(2, "Enter the vehicle make").max(40),
    model: z.string().trim().min(1, "Enter the model").max(40),
    year: z.coerce.number().int().min(1970, "Year must be 1970 or later").max(currentYear + 1, "Check the year of manufacture"),
    vehicleValue: z.coerce.number().positive("Enter the current value of the vehicle").max(200_000_000),
    vehicleUse: z.enum(["private", "commercial", "psv", "motorcycle"]),
  }),
  "health-and-medical": z.object({
    numberOfPersons: z.coerce.number().int().min(1).max(30),
    ages: z.string().trim().min(1, "List the ages of the people to be covered").max(160),
    preExistingConditions: z.string().trim().max(1200).optional().default("None declared"),
    inpatientLimit: z.enum(["1000000", "3000000", "5000000", "10000000", "not-sure"]).optional(),
  }),
  "life-insurance": z.object({
    age: z.coerce.number().int().min(18, "Life cover starts at 18").max(75, "Cover above 75 is assessed individually"),
    smoker: z.enum(["no", "yes", "quit"]),
    sumAssured: z.coerce.number().min(500_000, "Most Kenyan insurers set a minimum of KES 500,000").max(500_000_000),
    term: z.coerce.number().int().min(5).max(40).optional(),
    coverFor: z.enum(["myself", "myself-and-spouse", "family"]).optional(),
  }),
  "home-and-property": z.object({
    propertyValue: z.coerce.number().positive("Enter the reinstatement or market value").max(2_000_000_000),
    propertyType: z.enum(["house", "apartment", "townhouse", "commercial", "other"]),
    occupancy: z.enum(["owner-occupied", "rented-out", "tenant", "vacant"]),
    location: z.string().trim().min(2, "Where is the property? Enter the town or estate").max(120),
    contentsValue: z.coerce.number().min(0).max(500_000_000).optional(),
    mortgageProvider: z.string().trim().max(120).optional(),
  }),
  "business-insurance": z.object({
    companyName: z.string().trim().min(2, "Enter the business name").max(160),
    industry: z.string().trim().min(2).max(80),
    employees: z.coerce.number().int().min(0).max(100_000),
    coversNeeded: z.array(z.string().trim().max(60)).min(1, "Select at least one cover"),
    turnoverBand: z
      .enum(["under-5m", "5m-20m", "20m-100m", "over-100m", "prefer-not-to-say"])
      .optional(),
  }),
  "travel-insurance": z.object({
    destination: z.string().trim().min(2, "Where are you travelling to?").max(120),
    departureDate: z.string().trim().min(4, "When do you leave?").max(30),
    returnDate: z.string().trim().min(4, "When do you return?").max(30),
    travellers: z.coerce.number().int().min(1).max(30),
    purpose: z.enum(["holiday", "business", "study", "medical", "other"]),
  }),
} as const;

export type QuoteDetailType = keyof typeof QUOTE_DETAIL_SCHEMAS;

export const INSURANCE_TYPES = Object.keys(QUOTE_DETAIL_SCHEMAS) as QuoteDetailType[];

/* ------------------------------------------------------------- submissions */

export const quoteRequestSchema = z.object({
  insuranceType: z.enum(INSURANCE_TYPES as [QuoteDetailType, ...QuoteDetailType[]]),
  details: z.record(z.string(), z.union([z.string(), z.number(), z.array(z.string())])).default({}),
  fullName: personName,
  idNumber: kenyanId,
  phone: kenyanPhone,
  email,
  county,
  preferredContact: z.enum(["whatsapp", "phone", "email"]).default("whatsapp"),
  notes: z.string().trim().max(1200).optional(),
  consent: z.literal(true, { error: "We need your consent to process this request under the Data Protection Act 2019" }),
  source: z.string().trim().max(80).optional(),
  ...captcha,
});

export const groupEnquirySchema = z.object({
  companyName: z.string().trim().min(2, "Enter the company name").max(160),
  industry: z.string().trim().min(2, "Select or enter the industry").max(80),
  contactName: personName,
  email,
  phone: kenyanPhone,
  employees: z.coerce.number().int().min(1, "Enter the number of employees").max(100_000),
  coversNeeded: z.array(z.string().trim().max(60)).min(1, "Select at least one cover"),
  currentScheme: z.string().trim().max(160).optional(),
  notes: z.string().trim().max(1600).optional(),
  consent: z.literal(true, { error: "We need your consent to process this enquiry" }),
  ...captcha,
});

export const claimNotificationSchema = z.object({
  policyNumber: z.string().trim().min(3, "Enter the policy number").max(60),
  insurer: z.string().trim().min(2, "Which insurer issued the policy?").max(120),
  claimantName: personName,
  phone: kenyanPhone,
  email: email.optional(),
  incidentDate: z.string().trim().min(4, "When did the incident happen?").max(30),
  incidentType: z.enum(["motor-accident", "theft", "fire", "medical", "property-damage", "death", "other"]),
  description: z.string().trim().min(20, "Describe what happened in at least a sentence").max(4000),
  estimatedValue: z.coerce.number().min(0).max(1_000_000_000).optional(),
  documents: z
    .array(
      z.object({
        name: z.string().trim().max(200),
        size: z.number().nonnegative(),
        type: z.string().trim().max(120),
        url: z.string().trim().max(2048),
        pathname: z.string().trim().max(2048).optional(),
      }),
    )
    .max(8)
    .default([]),
  consent: z.literal(true, { error: "We need your consent to process this claim notification" }),
  ...captcha,
});

export const contactSchema = z.object({
  name: personName,
  email,
  phone: kenyanPhone,
  subject: z.enum([
    "New quotation",
    "Existing policy",
    "Claim",
    "Group medical scheme",
    "Careers",
    "Something else",
  ]),
  message: z.string().trim().min(10, "Tell us how we can help").max(2000),
  consent: z.literal(true, { error: "We need your consent to reply to you" }),
  ...captcha,
});

export const newsletterSchema = z.object({
  email,
  name: z.string().trim().max(120).optional(),
  interests: z.array(z.string().trim().max(60)).max(6).optional(),
  consent: z.literal(true, { error: "Please confirm you would like to receive the newsletter" }),
  source: z.string().trim().max(80).optional(),
  ...captcha,
});

/* ------------------------------------------------------------------ portal */

export const portalRequestOtpSchema = z.object({
  email,
  policyReference: z
    .string()
    .trim()
    .min(6, "Enter the policy reference from your schedule")
    .max(40, "That reference is too long"),
  ...captcha,
});

export const portalVerifyOtpSchema = z.object({
  email,
  code: z.string().trim().regex(/^\d{6}$/, "Enter the six digit code we sent you"),
});

export const portalMessageSchema = z.object({
  policyReference: z.string().trim().min(3).max(40).optional(),
  subject: z.string().trim().min(3, "Give your message a subject").max(140),
  body: z.string().trim().min(10, "Tell your broker what you need").max(2000),
});

/* --------------------------------------------------------------- utilities */

/** First error message per field, for inline display. */
export const fieldErrors = (error: z.ZodError): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
};

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type GroupEnquiry = z.infer<typeof groupEnquirySchema>;
export type ClaimNotification = z.infer<typeof claimNotificationSchema>;
export type ContactMessage = z.infer<typeof contactSchema>;
export type NewsletterSignup = z.infer<typeof newsletterSchema>;
