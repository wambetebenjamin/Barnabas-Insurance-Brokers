/**
 * Environment access.
 *
 * Every environment variable in this project is read here and nowhere else, so
 * there is exactly one place to audit. Secrets are only ever touched on the
 * server: nothing in this module is imported by a client component except the
 * `publicEnv` object, which contains NEXT_PUBLIC_* values only.
 *
 * Nothing throws at import time - the site must boot without any variables set
 * so that a fresh clone and a Vercel preview both work. Features degrade
 * explicitly and report which variable is missing.
 */

const raw = (key: string, fallback = ""): string => {
  const value = process.env[key];
  return value === undefined || value === "" ? fallback : value;
};

const bool = (key: string, fallback = false): boolean => {
  const value = process.env[key];
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

const num = (key: string, fallback: number): number => {
  const parsed = Number(process.env[key]);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/* ------------------------------------------------------------------ public */

export const publicEnv = {
  siteUrl: raw("NEXT_PUBLIC_SITE_URL", "http://localhost:3000").replace(/\/$/, ""),
  /** IRA Kenya broker licence number. Placeholder until the real one is set. */
  iraLicenseNumber: raw("NEXT_PUBLIC_IRA_LICENSE_NUMBER", "IRA/BRK/0000/2025"),
  akiMemberNumber: raw("NEXT_PUBLIC_AKI_MEMBER_NUMBER", "AKI/MEM/0000"),
  brokerPhone: raw("NEXT_PUBLIC_BROKER_PHONE", "+254112272061"),
  brokerEmail: raw("NEXT_PUBLIC_BROKER_EMAIL", "info@barnabasinsurancebrokers.co.ke"),
  whatsappNumber: raw("NEXT_PUBLIC_WHATSAPP_NUMBER", "254112272061"),
  officeAddress: raw(
    "NEXT_PUBLIC_OFFICE_ADDRESS",
    "Kimathi Street, Nairobi CBD, Nairobi, Kenya",
  ),
  officeHours: raw(
    "NEXT_PUBLIC_OFFICE_HOURS",
    "Mon - Fri : 08 AM - 05 PM, Sat : 09 AM - 01 PM",
  ),
  mapsEmbed: raw(
    "NEXT_PUBLIC_GOOGLE_MAPS_EMBED",
    "https://maps.google.com/maps?q=Nairobi%20CBD%2C%20Kenya&output=embed",
  ),
  recaptchaSiteKey: raw("NEXT_PUBLIC_RECAPTCHA_SITE_KEY"),
  recaptchaV2SiteKey: raw("NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY"),
  pexelsAttribution: raw("NEXT_PUBLIC_PEXELS_ATTRIBUTION", "Photos from Pexels"),
} as const;

/* ------------------------------------------------------------------ server */

export const serverEnv = {
  get recaptchaSecret() {
    return raw("RECAPTCHA_SECRET_KEY");
  },
  get recaptchaV2Secret() {
    return raw("RECAPTCHA_V2_SECRET_KEY");
  },
  /** v3 minimum score (brief: v2 fallback under 0.5). */
  get recaptchaMinScore() {
    return num("RECAPTCHA_MIN_SCORE", 0.5);
  },
  /**
   * false (default) = fail closed when Google’s verification endpoint cannot be
   * reached. true = accept and log. Never a silent bypass: the decision is
   * recorded on the lead.
   */
  get recaptchaFailOpen() {
    return bool("RECAPTCHA_FAIL_OPEN", false);
  },

  get kvUrl() {
    return raw("KV_REST_API_URL");
  },
  get kvToken() {
    return raw("KV_REST_API_TOKEN");
  },
  get blobToken() {
    return raw("BLOB_READ_WRITE_TOKEN");
  },

  get smtpHost() {
    return raw("SMTP_HOST");
  },
  get smtpPort() {
    return num("SMTP_PORT", 587);
  },
  get smtpSecure() {
    return bool("SMTP_SECURE", false);
  },
  get smtpUser() {
    return raw("SMTP_USER");
  },
  get smtpPassword() {
    return raw("SMTP_PASSWORD");
  },
  get mailFrom() {
    return raw("MAIL_FROM", "Barnabas Insurance Brokers <no-reply@barnabasinsurancebrokers.co.ke>");
  },
  get mailToBroker() {
    return raw("MAIL_TO_BROKER", publicEnv.brokerEmail);
  },

  get whatsappApiUrl() {
    return raw("WHATSAPP_API_URL", "https://graph.facebook.com/v21.0");
  },
  get whatsappApiToken() {
    return raw("WHATSAPP_API_TOKEN");
  },
  get whatsappPhoneNumberId() {
    return raw("WHATSAPP_PHONE_NUMBER_ID");
  },
  get whatsappBrokerNumber() {
    return raw("WHATSAPP_BROKER_NUMBER", publicEnv.whatsappNumber);
  },

  get adminToken() {
    return raw("ADMIN_TOKEN");
  },
  /** Preview/dev only: returns the portal OTP in the API response. */
  get portalDemoMode() {
    return bool("PORTAL_DEMO_MODE", process.env.NODE_ENV !== "production");
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
} as const;

/* -------------------------------------------------- capability discovery */

export const capabilities = {
  get kv() {
    return Boolean(serverEnv.kvUrl && serverEnv.kvToken);
  },
  get blob() {
    return Boolean(serverEnv.blobToken);
  },
  get mail() {
    return Boolean(serverEnv.smtpHost && serverEnv.smtpUser && serverEnv.smtpPassword);
  },
  get whatsappApi() {
    return Boolean(serverEnv.whatsappApiToken && serverEnv.whatsappPhoneNumberId);
  },
  get recaptcha() {
    return Boolean(publicEnv.recaptchaSiteKey && serverEnv.recaptchaSecret);
  },
  get recaptchaV2() {
    return Boolean(publicEnv.recaptchaV2SiteKey && serverEnv.recaptchaV2Secret);
  },
  get admin() {
    return Boolean(serverEnv.adminToken);
  },
} as const;

/**
 * A machine-readable report of what is configured. Surfaced at
 * GET /api/health so a deploy can be verified without reading logs.
 * Contains no secret values - booleans and public strings only.
 */
export const configReport = () => ({
  kv: capabilities.kv,
  blob: capabilities.blob,
  mail: capabilities.mail,
  whatsappApi: capabilities.whatsappApi,
  recaptcha: capabilities.recaptcha,
  recaptchaV2: capabilities.recaptchaV2,
  admin: capabilities.admin,
  portalDemoMode: serverEnv.portalDemoMode,
  siteUrl: publicEnv.siteUrl,
  iraLicenseNumber: publicEnv.iraLicenseNumber,
  pexelsKeyPresent: Boolean(process.env.PEXELS_API_KEY),
});
