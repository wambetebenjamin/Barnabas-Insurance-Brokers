/**
 * Terms of service (brief section 16).
 *
 * Required sections: Brokerage Disclaimer (we advise, insurers pay), Quotation
 * Validity Period, Claim Process Disclaimer, Governing Law Kenya and IRA Regulations.
 */
import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service | Barnabas Insurance Brokers",
  description:
    "Terms governing the use of this website and the brokerage services of Barnabas Insurance Brokers, including the brokerage disclaimer, quotation validity, claims, and Kenyan governing law.",
  path: "/legal/terms",
});

const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    heading: "1. Who we are and what these terms cover",
    blocks: [
      {
        type: "p",
        text: `These terms govern your use of this website and the brokerage services provided by **${SITE.legalName}** ("Barnabas Insurance Brokers", "we", "us"), an insurance brokerage licensed by the Insurance Regulatory Authority of Kenya under licence **${SITE.iraLicenseNumber}**, of ${SITE.address}.`,
      },
      {
        type: "p",
        text: "By requesting a quotation, submitting a form, or using the client portal, you agree to these terms. If you do not agree with them, please contact us before we act for you, because we can only place cover on these terms.",
      },
      {
        type: "p",
        text: "These terms are in addition to, and do not replace, the terms of the insurance policy itself. The insurer’s policy document and schedule govern the contract of insurance.",
      },
    ],
  },
  {
    id: "brokerage-disclaimer",
    heading: "2. Brokerage disclaimer: we advise, the insurer pays",
    blocks: [
      {
        type: "note",
        text: "**We advise and place cover. The insurer pays claims.** Barnabas Insurance Brokers is not an insurer. We do not underwrite risk, we do not hold the funds that pay claims, and we cannot guarantee that an insurer will accept a risk or pay a claim.",
      },
      { type: "list", items: [
        "**Our role** is to understand your needs, compare the market, recommend suitable cover, place it with a licensed insurer, and act for you in servicing and claims.",
        "**The insurer’s role** is to underwrite the risk, issue the policy, and pay valid claims in accordance with the policy terms. Payment of any claim is the insurer’s obligation, not ours.",
        "**Our advice is not a guarantee of cover.** A recommendation in writing or verbally is not itself an insurance contract. Cover begins only when an insurer accepts the risk and issues the policy or a certificate, and premium has been paid as required.",
        "**Commission disclosure.** We are paid commission by the insurer out of the premium you pay. Where we act under a fee arrangement, the fee is agreed with you in writing before we start work. We disclose the arrangement on request and before you place cover.",
        "**Insurer solvency.** Every insurer we place cover with is licensed and regulated by the IRA, which prescribes solvency and reporting obligations. We cannot guarantee an insurer’s future solvency, and we monitor our panel’s financial standing as part of our own risk management.",
        "**Claims decisions.** An insurer’s decision on a claim is made under the policy wording, often with the assistance of an assessor. We challenge decisions we consider wrong and escalate them where necessary, but the decision remains the insurer’s.",
      ] },
    ],
  },
  {
    id: "quotations",
    heading: "3. Quotation validity period",
    blocks: [
      {
        type: "p",
        text: "**Quotations we issue are valid for 30 days from the date of issue**, unless the quotation states otherwise, or unless the insurer changes its rates or underwriting terms inside that period.",
      },
      { type: "list", items: [
        "Premiums on this website are **indicative** and are shown for the profile described next to them. They are not an offer of insurance and are not binding on the insurer.",
        "The final premium is confirmed only after the insurer has underwritten the risk and issued the policy or certificate of insurance, and may be higher or lower than the indicative figure.",
        "A quotation that has expired, or one issued for a different vehicle, person, property, or business, cannot be relied upon. Ask us for a current quotation.",
        "Premium rates in Kenya respond to the market. Where a rate changes between quotation and inception, we will tell you before the policy is placed.",
        "Motor and medical quotations are subject to the vehicle or person being acceptable to the insurer at the time of placement.",
        "A quotation does not provide cover. Where you need cover before a policy is issued, ask us whether the insurer will grant interim or temporary cover, and how long it will last.",
      ] },
    ],
  },
  {
    id: "your-duties",
    heading: "4. Your duties: disclosure, accuracy and premium payment",
    blocks: [
      {
        type: "p",
        text: "Insurance in Kenya operates on the principle of utmost good faith. Failing in these duties is the most common reason a claim is reduced or declined.",
      },
      { type: "ordered", items: [
        "**Disclose everything material.** Answer every question on the proposal form accurately, including health conditions, previous claims, convictions, and how a vehicle or property is used. If you are unsure whether something matters, tell us and let the underwriter decide.",
        "**Keep us informed of changes.** Tell us if you move, change the use of a vehicle, alter a building, take on new drivers, increase your stock, or take on more employees. Some changes require the insurer’s consent, and a mid-term change may carry an additional or return premium.",
        "**Pay the premium.** A policy can be cancelled or a claim declined where premium is unpaid. Where you pay by instalment, missing one can void the cover.",
        "**Compliance with conditions and warranties.** Read the policy conditions: security requirements, unoccupancy limits, and the reporting periods for claims all matter.",
        "**Notify claims promptly.** Report incidents within the period the policy allows, and in any event within 48 hours where you can, so that evidence is preserved.",
      ] },
      {
        type: "note",
        text: "Where you give us information about another person, for example a spouse or an employee, you confirm that you are authorised to do so, and you are responsible for its accuracy.",
      },
    ],
  },
  {
    id: "claims",
    heading: "5. Claim process disclaimer",
    blocks: [
      { type: "note",
        text: "**We do not pay claims and we do not decide them.** We prepare, submit, and pursue claims for you, and we challenge decisions we consider wrong. The obligation to pay a valid claim rests with the insurer that issued your policy." },
      { type: "list", items: [
        "We open the claim with the insurer on your instruction and act as your broker in the process.",
        "An insurer may appoint an assessor, loss adjuster, or investigator. Their findings are usually, but not always, followed by the insurer.",
        "A claim can be reduced or declined for reasons set out in the policy, including non-disclosure, late notification, unapproved repairs, breaches of a policy condition, or an incident outside the scope of cover.",
        "Review periods vary. Straightforward motor and medical claims are commonly settled within two to six weeks. Property, liability, and business interruption claims commonly take longer.",
        "Documentation the insurer requires must come from you: police abstracts, medical reports, invoices, receipts, and completed claim forms. Delay in supplying them delays settlement.",
        "Where an insurer does not respond within the timelines the IRA prescribes, we escalate on your behalf to the insurer’s complaints function and then to the IRA.",
        "Where a claim is declined and you wish to challenge it, the IRA complaints process and, for motor claims, the Motor Insurance Appeals Tribunal are available. We assist you with either, and our assistance is included in the service we are already paid for.",
      ] },
    ],
  },
  {
    id: "portal",
    heading: "6. Client portal",
    blocks: [
      { type: "list", items: [
        "Access requires your email address, a policy reference, and a one-time code we send to that email address. Do not share the code, and tell us immediately if you think somebody else has accessed your account.",
        "Documents generated in the portal are convenience copies. The insurer’s own policy schedule and policy document govern the contract of insurance.",
        "Do not attempt to access another client’s data, to interfere with the portal, or to extract data from it except for your own policies. We may suspend access where we reasonably believe there has been misuse.",
        "You are responsible for keeping your email account secure, because access to it is access to your portal.",
      ] },
    ],
  },
  {
    id: "website-use",
    heading: "7. Website use, content and intellectual property",
    blocks: [
      { type: "list", items: [
        "The content on this website is general information about insurance in Kenya. It is not advice on your specific policy, and it does not replace the insurer’s policy wording.",
        "Comparison tables show indicative figures for the profile described. They are not an offer of cover and may not reflect the terms available to you.",
        "You may not scrape, republish, or resell the content or the comparison dataset without our written consent.",
        "The site design is derived from a licensed HTML template, and its attribution is preserved in the footer as that licence requires. Trade marks and insurer names belong to their respective owners and are used for identification only.",
        "Where we link to another website, we do not control it and we are not responsible for its content or its privacy practices.",
      ] },
    ],
  },
  {
    id: "liability",
    heading: "8. Limitation of liability",
    blocks: [
      { type: "list", items: [
        "We are liable for our own professional negligence, and our liability is limited to the extent permitted by the Insurance Act and the laws of Kenya.",
        "We are not liable for an insurer’s failure to pay a claim, for delays in an insurer’s processes, or for losses caused by an insurer’s insolvency.",
        "We are not liable for any decision an insurer takes, or for a declined claim arising from non-disclosure or a breach of a policy condition.",
        "We are not liable for indirect or consequential loss, including loss of profit, except where the loss was reasonably foreseeable and arises from our own failure.",
        "Nothing in these terms limits liability for fraud, or any liability that cannot be limited under Kenyan law.",
      ] },
    ],
  },
  {
    id: "complaints",
    heading: "9. Complaints",
    blocks: [
      { type: "ordered", items: [
        `**Tell us first.** Contact the broker who handles your account, or email ${SITE.email} or call ${SITE.phone}. We acknowledge complaints in writing and aim to resolve them within 14 days.`,
        "**Escalate internally.** If you are not satisfied with the response, ask for the matter to be reviewed by the principal broker, and we will give you a written decision with reasons.",
        "**Escalate to the IRA.** You may refer an unresolved complaint to the Insurance Regulatory Authority of Kenya. You do not have to wait for our internal process to finish.",
        "**Motor claims.** For a disputed motor claim you may also refer the matter to the Motor Insurance Appeals Tribunal.",
        "**Data matters.** For a complaint about how we handled personal data, you may complain to the Office of the Data Protection Commissioner, as set out in our [Privacy Policy](/legal/privacy-policy).",
      ] },
    ],
  },
  {
    id: "governing-law",
    heading: "10. Governing law: Kenya and IRA regulations",
    blocks: [
      {
        type: "p",
        text: "These terms, the website, and the brokerage relationship are governed by the **laws of the Republic of Kenya**.",
      },
      { type: "list", items: [
        "Our brokerage is regulated by the **Insurance Regulatory Authority (IRA) of Kenya** under the Insurance Act and the regulations made under it, including the Insurance (Insurance Industry Compensation Fund) Regulations and the conduct guidelines applicable to brokers.",
        "We are a member of the **Association of Kenya Insurers (AKI)**, " + SITE.akiMemberNumber + ".",
        "Insurance policies placed through us are governed by the law specified in the policy, which is ordinarily Kenyan law, and by the policy’s own dispute resolution and jurisdiction clauses.",
        "Any dispute with us that cannot be resolved between us, or through the IRA, is subject to the exclusive jurisdiction of the courts of Kenya.",
        "If any provision of these terms is held to be invalid, the remaining provisions continue in force.",
      ] },
      {
        type: "note",
        text: `Regulatory details for the record: broker licence **${SITE.iraLicenseNumber}**, AKI membership **${SITE.akiMemberNumber}**, registered office ${SITE.address}.`,
      },
    ],
  },
  {
    id: "changes",
    heading: "11. Changes and contact",
    blocks: [
      {
        type: "p",
        text: "We may update these terms when the law, the regulator’s requirements, or the services we offer change. The current version always appears on this page, with the date at the top. Continuing to use our services after a change means you accept the updated terms.",
      },
      {
        type: "p",
        text: `If anything in these terms is unclear, ask us before you place cover: email **${SITE.email}**, call **${SITE.phone}**, or visit the office at ${SITE.address}.`,
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="What we do, what the insurer does, how long a quotation lasts, how claims work, and which law applies."
      updated="2025-10-01"
      sections={SECTIONS}
    />
  );
}
