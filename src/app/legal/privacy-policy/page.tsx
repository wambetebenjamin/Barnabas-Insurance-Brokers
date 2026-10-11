/**
 * Privacy policy (brief section 16).
 *
 * Sections required by the brief: Personal Financial Data, Health Data (extra
 * protections), Vehicle Data, IRA Kenya Compliance, Analytics, Your Rights, Contact.
 * Written against the Kenya Data Protection Act 2019 and the Office of the Data
 * Protection Commissioner’s expectations.
 */
import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy | Barnabas Insurance Brokers",
  description:
    "How Barnabas Insurance Brokers collects, uses, shares, and protects personal, financial, health, and vehicle data under the Kenya Data Protection Act 2019.",
  path: "/legal/privacy-policy",
});

const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    heading: "1. Who we are and what this policy covers",
    blocks: [
      {
        type: "p",
        text: `**${SITE.legalName}** ("Barnabas Insurance Brokers", "we", "us") is an insurance brokerage regulated by the Insurance Regulatory Authority of Kenya under licence **${SITE.iraLicenseNumber}**, with its office at ${SITE.address}. We are the data controller for the personal data described in this policy.`,
      },
      {
        type: "p",
        text: "This policy explains what we collect when you request a quotation, enquire about a group scheme, notify a claim, subscribe to our newsletter, or sign in to the client portal, why we collect it, who we share it with, how long we keep it, and what you can require us to do with it.",
      },
      {
        type: "p",
        text: "It is written to meet the **Kenya Data Protection Act 2019** and the regulations made under it, and it is consistent with the Insurance Act and the Insurance Regulatory Authority’s conduct requirements. Where the two overlap, we apply the stricter standard to your data.",
      },
      { type: "list", items: [
        "**Data controller:** " + SITE.legalName + ", " + SITE.address,
        "**Contact for data matters:** " + SITE.email + ", " + SITE.phone,
        "**Supervisory authority:** Office of the Data Protection Commissioner (ODPC), Kenya",
      ] },
    ],
  },
  {
    id: "what-we-collect",
    heading: "2. What we collect and why",
    blocks: [
      {
        type: "p",
        text: "We collect only what is needed to place cover, service it, and meet our legal duties as a licensed broker.",
      },
      { type: "table", head: ["Category", "Examples", "Why we need it", "Lawful basis"], rows: [
        ["Identity and contact", "Full name, ID or passport number, phone, email, county, physical address", "To identify you to the insurer, to issue a policy, and to contact you about your cover", "Contract, legal obligation"],
        ["Personal financial data", "Premium amount, payment frequency, bank or M-PESA reference where provided, sum insured, policy numbers, claims history", "To arrange cover, collect premium, process refunds, and handle claims", "Contract, legal obligation, legitimate interest"],
        ["Health data", "Ages of dependants, pre-existing conditions declared, medical reports, hospital invoices and pre-authorisation records", "Medical underwriting: an insurer cannot assess a health risk without it. Claims cannot be paid without treatment records", "Explicit consent, substantial public interest in insurance"],
        ["Vehicle data", "Registration number, make, model, year of manufacture, value, declared use, drivers, tracking device details", "Motor underwriting and claims assessment", "Contract"],
        ["Property and business data", "Property location and value, occupancy, contents, staff numbers, turnover band", "To describe the risk accurately to insurers and avoid declined claims", "Contract, legitimate interest"],
        ["Communications", "Emails, WhatsApp messages, call notes, and the content of forms you submit", "To answer you, to evidence the advice we gave, and for our complaints handling", "Contract, legitimate interest, legal obligation"],
      ] },
      {
        type: "p",
        text: "We do not ask for your M-PESA PIN, your bank password, your card CVV, or any credential that would allow us to move your money. Anybody who does while claiming to represent us is committing fraud: report it to us immediately.",
      },
    ],
  },
  {
    id: "personal-financial-data",
    heading: "3. Personal financial data",
    blocks: [
      {
        type: "p",
        text: "Personal financial data is any information about your financial position or about a financial product you hold with us. In practice this means the sums insured, premiums, payment records, policy numbers, and claims history that sit behind your cover.",
      },
      { type: "list", items: [
        "We use it to prepare quotations, place cover with an insurer, collect premium, and administer claims.",
        "We share it only with the insurer or insurers underwriting your cover, their appointed loss adjusters, and, where a claim requires it, their assessors and investigators.",
        "We do not sell your financial data, and we do not pass it to any third party for marketing.",
        "Where a lender requires their interest to be noted on a policy, we share only the minimum detail the lender needs: the policy number, the sum insured, and the interest noted.",
        "Financial data is never published on a public page of this website, and it is never written into a URL.",
      ] },
      {
        type: "note",
        text: "Quotation data is stored in Vercel KV against a reference number. Your data is returned to you only through the client portal, which requires an email one-time code, or by our brokers through our office systems.",
      },
    ],
  },
  {
    id: "health-data",
    heading: "4. Health data: extra protections",
    blocks: [
      {
        type: "p",
        text: "Health information is the most sensitive category we handle. Under the Data Protection Act 2019 it is treated as sensitive personal data, and we apply the following controls on top of everything else in this policy.",
      },
      { type: "list", items: [
        "**Explicit consent.** We ask for your explicit, separate consent before we share health information with a medical insurer. The consent checkbox on our forms covers this and nothing else.",
        "**Minimum necessary.** We share the specific declared condition, age, and treatment history that the underwriter must assess, and nothing beyond it.",
        "**Purpose limitation.** Health data is used only for underwriting, placing cover, pre-authorisation, and claims. It is never used for marketing, never for analytics, and never for advertising audiences.",
        "**Named access.** Within our office, only the medical schemes team can open a client’s health records, and access is logged.",
        "**Retention.** Health records attached to a claim are kept for seven years from the end of the policy year, which is the period an insurer may need to defend a claim, and are then deleted.",
        "**Dependants.** If you declare information about a spouse or child, you confirm that you are authorised to share it, and we use it only for their cover.",
        "**No public exposure.** Health data never appears on a public route of this site, and it is never sent to a third party analytics provider.",
      ] },
      {
        type: "note",
        text: "If you are not comfortable declaring a condition, be aware of the alternative: an insurer can decline a claim for a condition that was not disclosed. Declaring it does not automatically exclude it, and we will negotiate the terms on your behalf.",
      },
    ],
  },
  {
    id: "vehicle-data",
    heading: "5. Vehicle data",
    blocks: [
      {
        type: "p",
        text: "For motor insurance we collect the registration number, make and model, year of manufacture, current value, declared use, the location where the vehicle is kept overnight, the details of regular drivers, and any tracking device fitted.",
      },
      { type: "list", items: [
        "**Why:** insurers rate the risk from these facts, and a claim can be declined where the declared use or overnight location was wrong.",
        "**Who receives it:** the underwriting insurer, and following a claim, their assessor, the approved repair garage, and for theft claims, the police through the abstract process.",
        "**Registration number:** it is a personal identifier when linked to you, so it is treated as personal data and never published on this site.",
        "**Telematics and tracking:** where an insurer requires or discounts for a tracking device, the device provider’s own privacy terms apply to the data they hold. We do not access tracking data and we will tell you before you buy a device.",
        "**Retention:** motor policy data is kept for seven years after the policy ends, to satisfy the Insurance Act records requirement and to defend claims and complaints.",
      ] },
    ],
  },
  {
    id: "ira-compliance",
    heading: "6. IRA Kenya compliance",
    blocks: [
      {
        type: "p",
        text: `As a licensed insurance broker, some processing is not optional. The Insurance Act, the IRA’s regulations, and the guidelines on market conduct require us to:`,
      },
      { type: "ordered", items: [
        "Verify your identity and keep records of the advice we gave you and the cover we placed.",
        "Keep a policy register and retain policy records for the periods the regulator prescribes, which is why retention in this policy is seven years rather than one.",
        "Report to the IRA, and to bodies such as the Insurance Fraud Investigation Unit, where we are legally required to do so, including in cases of suspected fraud.",
        "Co-operate with the IRA and with the Motor Insurance Appeals Tribunal in the resolution of complaints, which may require sharing your file.",
        "Display our licence number accurately: our IRA licence number is " + SITE.iraLicenseNumber + ", and we are a member of the Association of Kenya Insurers (" + SITE.akiMemberNumber + ").",
      ] },
      {
        type: "p",
        text: "Where a legal obligation compels us to process or disclose data, that obligation overrides a request to delete it, and we will tell you when we are relying on it.",
      },
      {
        type: "note",
        text: "Regulatory references in this section do not limit your rights under the Data Protection Act 2019. Where you believe our processing breaches that Act, you may complain to the ODPC as set out in section 10.",
      },
    ],
  },
  {
    id: "analytics",
    heading: "7. Analytics, cookies and advertising",
    blocks: [
      {
        type: "p",
        text: "This website uses cookies and local storage. The full breakdown, including the name, purpose, and retention period of each one, is in the [Cookie Policy](/legal/cookie-policy). In summary:",
      },
      { type: "list", items: [
        "**Necessary cookies** keep the site working and remember your consent choice. They cannot be switched off.",
        "**Functional cookies** remember preferences such as the insurance type you were comparing. Optional.",
        "**Analytics cookies** measure which pages and products are used most. Aggregate statistics only, and no financial or health data is ever included. Optional.",
        "**Marketing cookies** measure whether our campaigns reach real Kenyan clients. Optional. We do not sell client data, and we do not upload client lists to advertising platforms.",
      ] },
      {
        type: "p",
        text: "You choose on the cookie banner, and you can change your mind at any time through the **Cookie preferences** link in the footer. Refusing optional cookies does not limit any part of the site, including the quotation form and the client portal.",
      },
      {
        type: "p",
        text: "We do not use third-party advertising pixels that build a profile of you across other websites, and we do not send your health or financial information to any analytics provider under any circumstances.",
      },
    ],
  },
  {
    id: "sharing",
    heading: "8. Who else receives your data",
    blocks: [
      { type: "list", items: [
        "**Insurers** who are underwriting or quoting your cover, and their reinsurers where a large risk is involved.",
        "**Loss adjusters, assessors, investigators, and repair garages** engaged on a specific claim.",
        "**Medical service providers** for pre-authorisation and direct settlement of hospital bills.",
        "**Service providers who process on our behalf**, under contract and only on our instructions: our hosting provider (Vercel) for the website and storage, our email provider for notifications and newsletters, and Meta (WhatsApp) where a message about your enquiry is delivered through WhatsApp. We send the minimum detail needed to deliver the message.",
        "**Regulators and law enforcement**, where the law requires it, including the IRA and the Insurance Fraud Investigation Unit.",
        "**Professional advisers** such as our auditors and lawyers, where necessary and under confidentiality obligations.",
      ] },
      {
        type: "p",
        text: "Some of these recipients process data outside Kenya. Where that happens, we rely on the safeguards the Data Protection Act 2019 requires, which in practice means the provider’s binding contractual data protection terms and standard clauses that are at least as protective as Kenyan law.",
      },
    ],
  },
  {
    id: "retention",
    heading: "9. How long we keep it",
    blocks: [
      { type: "table", head: ["Record", "Retention period", "Reason"], rows: [
        ["Quotation requests that do not become policies", "24 months", "To follow up and to evidence the advice given"],
        ["Quotations you ask us to keep on file", "Until you ask us to delete them, or 24 months", "Your instruction"],
        ["Live policies and schedules", "Life of the policy, plus 7 years", "Insurance Act record keeping"],
        ["Claims files, including health records", "7 years from the end of the policy year", "Claim defence and IRA requirements"],
        ["Group scheme employee data", "Life of the scheme, plus 7 years", "Scheme administration and audit"],
        ["Newsletter subscribers", "Until you unsubscribe, plus 12 months to evidence it", "Consent, and proof of withdrawal"],
        ["Website analytics", "14 months", "Seasonal comparison, then aggregation only"],
        ["Job applications", "12 months unless you ask us to keep them longer", "Recruitment, and your own request"],
      ] },
      { type: "p", text: "When a retention period ends we delete the record or, where deletion is not practical in a backup, we isolate it until the backup cycle overwrites it." },
    ],
  },
  {
    id: "security",
    heading: "10. How we protect your data",
    blocks: [
      { type: "list", items: [
        "HTTPS everywhere, with HSTS enabled and a strict content security policy.",
        "Client portal access requires a one-time code sent to your email address. Sessions expire after eight hours and are protected by an HTTP-only, same-site cookie.",
        "Policy data and claim documents are served only through session-guarded routes, with caching disabled, so a browser or intermediary cannot retain them.",
        "Secrets and API keys are held in environment variables, never in the repository and never in client-side code.",
        "Form submissions are protected by reCAPTCHA and rate limited per connection.",
        "Access to client records inside our office is limited to the team that needs it, and we log who opens a health or claims record.",
      ] },
      {
        type: "p",
        text: "If a breach occurs that is likely to result in a risk to your rights, we will notify you and the Office of the Data Protection Commissioner without undue delay, and in any event within 72 hours of becoming aware of it, describing what happened, what we have done, and what you should do.",
      },
    ],
  },
  {
    id: "your-rights",
    heading: "11. Your rights",
    blocks: [
      { type: "p", text: "Under the Data Protection Act 2019 you have the right to:" },
      { type: "ordered", items: [
        "**Be informed** about how we use your data, which this policy does.",
        "**Access** the personal data we hold about you, and to receive a copy.",
        "**Correct** data that is inaccurate or incomplete, including data we have already passed to an insurer.",
        "**Delete** data we no longer need and are not required by law to keep, subject to the retention periods in section 9.",
        "**Restrict or object** to processing, including objecting to direct marketing at any time.",
        "**Withdraw consent** at any time, including consent for health data and for the newsletter. Withdrawal does not affect processing already carried out lawfully.",
        "**Portability**, to receive your data in a structured, commonly used electronic format.",
        "**Not be subject to automated decision making** that produces legal or significant effects. We do not make such decisions: every underwriting decision is made by a human at the insurer.",
        "**Complain** to the Office of the Data Protection Commissioner, and to the IRA where the matter concerns the conduct of an insurer.",
      ] },
      {
        type: "p",
        text: `To exercise any of these rights, email **${SITE.email}** or call **${SITE.phone}** and ask for the data protection contact. We will respond within 30 days. We may ask you to verify your identity, and we will not charge for a request unless it is manifestly unfounded or repetitive.`,
      },
      {
        type: "note",
        text: "If we have already passed data to an insurer, we cannot delete it from their records ourselves. We will tell you which insurer holds it and, where you ask us to, we will write to them with your instruction on your behalf.",
      },
    ],
  },
  {
    id: "children",
    heading: "12. Children and dependants",
    blocks: [
      {
        type: "p",
        text: "We handle children’s data only where a child is a dependant on a policy or a beneficiary of a life policy. We ask for the minimum: usually an age and a first name. Where a child is old enough to understand, and in any event from the age of 18, they can exercise their own rights.",
      },
    ],
  },
  {
    id: "changes",
    heading: "13. Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "When we change how we use personal data we update this page and change the last updated date at the top. Where the change is significant, we will tell clients with a live policy by email or WhatsApp. Previous versions are available on request.",
      },
    ],
  },
  {
    id: "contact",
    heading: "14. Contact us",
    blocks: [
      {
        type: "p",
        text: `Questions, requests, or complaints about how we handle your data should go to the data protection contact at ${SITE.legalName}.`,
      },
      { type: "list", items: [
        `**Email:** ${SITE.email}`,
        `**Phone and WhatsApp:** ${SITE.phone}`,
        `**Post and office:** ${SITE.address}`,
        "**Office hours:** " + SITE.hours,
        "**Supervisory authority:** Office of the Data Protection Commissioner, Nairobi, Kenya. You may complain to the ODPC at any time, and we will co-operate fully with any enquiry they open.",
      ] },
      {
        type: "note",
        text: "Insurance complaints follow a different route: see our [Terms of Service](/legal/terms) for how to escalate a service or claim complaint to the IRA.",
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="How we collect, use, share, and protect your personal, financial, health, and vehicle data, and the rights you have under the Kenya Data Protection Act 2019."
      updated="2025-10-01"
      sections={SECTIONS}
    />
  );
}
