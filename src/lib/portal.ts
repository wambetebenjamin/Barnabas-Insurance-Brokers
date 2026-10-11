/**
 * Client portal data.
 *
 * Policy schedules, renewal dates, premium details and broker messages. All of it
 * is financial data about a named person, so:
 *   - every function here is called only from a session-guarded route
 *   - every response is Cache-Control: no-store
 *   - nothing here is ever imported by a public page
 *
 * Policy records live in Vercel KV under the client’s email. A new client whose
 * broker has not yet loaded their schedule gets an empty list rather than
 * invented data, except in preview mode where clearly labelled sample policies are
 * shown so the portal can be reviewed. The backend reports which of the two it is.
 */
import { KEYS, getJson, setJson, append, list, type Record as StoreRecord } from "@/lib/store";
import { serverEnv } from "@/lib/env";
import { SITE } from "@/lib/site";

export interface PolicyDocument {
  name: string;
  kind: "schedule" | "certificate" | "wording" | "endorsement";
  updatedAt: string;
}

export interface Policy {
  reference: string;
  policyNumber: string;
  insurer: string;
  product: string;
  coverSummary: string;
  sumInsured: number;
  premium: number;
  premiumFrequency: "monthly" | "quarterly" | "annual";
  startDate: string;
  renewalDate: string;
  status: "active" | "due-for-renewal" | "lapsed";
  dependants?: string[];
  benefits: string[];
  documents: PolicyDocument[];
  broker: { name: string; phone: string; email: string };
}

export interface PortalMessage {
  id: string;
  createdAt: string;
  from: "client" | "broker";
  subject: string;
  body: string;
  policyReference?: string;
}

const iso = (date: Date): string => date.toISOString().slice(0, 10);

const addMonths = (date: Date, months: number): Date => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

/**
 * Clearly labelled sample schedules, used only when the portal is in preview mode
 * (PORTAL_DEMO_MODE, which defaults to on outside production). Every screen that
 * shows these says so.
 */
function samplePolicies(email: string): Policy[] {
  const today = new Date();
  return [
    {
      reference: "BIB-P-250011-A1B2",
      policyNumber: "JUB/MOT/2025/004821",
      insurer: "Jubilee Insurance",
      product: "Motor insurance",
      coverSummary: "Comprehensive, private saloon, sum insured KES 2,500,000",
      sumInsured: 2_500_000,
      premium: 96_400,
      premiumFrequency: "annual",
      startDate: iso(addMonths(today, -7)),
      renewalDate: iso(addMonths(today, 5)),
      status: "active",
      benefits: [
        "Own damage to market value",
        "Third party property damage up to KES 10,000,000",
        "Towing and recovery to the approved garage",
        "Political violence and terrorism cover included",
      ],
      documents: [
        { name: "Motor policy schedule 2025.pdf", kind: "schedule", updatedAt: iso(addMonths(today, -7)) },
        { name: "Certificate of insurance.pdf", kind: "certificate", updatedAt: iso(addMonths(today, -7)) },
      ],
      broker: { name: "Barnabas broker desk", phone: SITE.phone, email: SITE.email },
    },
    {
      reference: "BIB-P-250011-C3D4",
      policyNumber: "BRT/MED/2025/118207",
      insurer: "Britam Insurance",
      product: "Health and medical",
      coverSummary: "Family cover, KES 5,000,000 inpatient, outpatient included",
      sumInsured: 5_000_000,
      premium: 42_600,
      premiumFrequency: "quarterly",
      startDate: iso(addMonths(today, -9)),
      renewalDate: iso(addMonths(today, 3)),
      status: "active",
      dependants: ["Spouse, age 35", "Child, age 8", "Child, age 5"],
      benefits: [
        "Inpatient and day care, KES 5,000,000",
        "Outpatient KES 200,000 per family",
        "Maternity KES 250,000",
        "Chronic conditions covered after the waiting period",
      ],
      documents: [
        { name: "Family medical schedule 2025.pdf", kind: "schedule", updatedAt: iso(addMonths(today, -9)) },
        { name: "Member guide and hospital list.pdf", kind: "wording", updatedAt: iso(addMonths(today, -9)) },
      ],
      broker: { name: "Barnabas broker desk", phone: SITE.phone, email: SITE.email },
    },
    {
      reference: "BIB-P-250011-E5F6",
      policyNumber: "ICL/LIF/2024/773310",
      insurer: "ICEA LION Life Assurance",
      product: "Life insurance",
      coverSummary: "Term life, KES 5,000,000 sum assured, accidental death rider",
      sumInsured: 5_000_000,
      premium: 21_600,
      premiumFrequency: "annual",
      startDate: iso(addMonths(today, -14)),
      renewalDate: iso(addMonths(today, 1)),
      status: "due-for-renewal",
      benefits: [
        "Death benefit paid to nominated beneficiaries",
        "Terminal illness acceleration",
        "Accidental death double indemnity",
      ],
      documents: [
        { name: "Life policy document.pdf", kind: "schedule", updatedAt: iso(addMonths(today, -14)) },
      ],
      broker: { name: "Barnabas broker desk", phone: SITE.phone, email: SITE.email },
    },
  ];
}

export interface PoliciesResult {
  policies: Policy[];
  /** "kv" when real schedules were found, "sample" while the portal is in preview. */
  source: "kv" | "sample" | "empty";
  sampleLabel?: string;
}

export async function getPolicies(email: string): Promise<PoliciesResult> {
  void email; // The email is the key; it is never returned in the payload.
  const stored = await getJson<Policy[]>(KEYS.portalPolicies(email));
  if (stored && stored.length > 0) return { policies: stored, source: "kv" };

  if (serverEnv.portalDemoMode) {
    const policies = samplePolicies(email).map((policy) => ({
      ...policy,
      status: computeStatus(policy.renewalDate),
    }));
    return {
      policies,
      source: "sample",
      sampleLabel:
        "These are sample schedules shown because PORTAL_DEMO_MODE is on. Your broker loads real policy data into Vercel KV when your cover is placed.",
    };
  }

  return { policies: [], source: "empty" };
}

/** Keeps the status pill honest: renewal date drives it, not a stored flag. */
export function computeStatus(renewalDate: string): Policy["status"] {
  const renewal = new Date(renewalDate).getTime();
  const now = Date.now();
  const days = (renewal - now) / 86_400_000;
  if (days < 0) return "lapsed";
  if (days <= 45) return "due-for-renewal";
  return "active";
}

export async function savePolicies(email: string, policies: Policy[]): Promise<void> {
  await setJson(KEYS.portalPolicies(email), policies);
}

export async function getMessages(email: string): Promise<PortalMessage[]> {
  const records = await list(KEYS.portalMessages(email), 50);
  return records.map((record) => ({
    id: String(record.id),
    createdAt: String(record.createdAt),
    from: (record.from as "client" | "broker") ?? "broker",
    subject: String(record.subject ?? "Message"),
    body: String(record.body ?? ""),
    policyReference: record.policyReference ? String(record.policyReference) : undefined,
  }));
}

export async function addMessage(email: string, message: PortalMessage): Promise<boolean> {
  const result = await append(KEYS.portalMessages(email) , message as unknown as StoreRecord);
  return result.stored;
}
