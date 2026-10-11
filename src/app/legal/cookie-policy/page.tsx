/**
 * Cookie policy (brief section 16): "Full breakdown".
 *
 * Every cookie and local storage key this site actually sets is listed with its
 * name, category, purpose, and retention. The list is written against the
 * implementation, not copied from a template, so a client can check it.
 */
import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Cookie Policy | Barnabas Insurance Brokers",
  description:
    "Every cookie and local storage key used on the Barnabas Insurance Brokers website, what each one does, how long it lasts, and how to withdraw consent under the Kenya Data Protection Act 2019.",
  path: "/legal/cookie-policy",
});

const SECTIONS: LegalSection[] = [
  {
    id: "what-are-cookies",
    heading: "1. What cookies are, and what we use instead",
    blocks: [
      {
        type: "p",
        text: "A cookie is a small file a website stores in your browser. It lets the site remember something between pages or between visits, such as whether you have already seen the cookie notice or whether you are signed in to the client portal.",
      },
      {
        type: "p",
        text: "This site also uses **local storage** and **session storage**, which work in a similar way but are not transmitted to our servers on every request. Where this policy says \"cookie\", it covers those technologies too, because your consent applies the same way.",
      },
      {
        type: "p",
        text: "Under the **Kenya Data Protection Act 2019**, consent for cookies must be informed, specific, and able to be withdrawn. That is why the banner names the four categories, why each one is described below, and why the **Cookie preferences** link in the footer reopens the choice at any time.",
      },
    ],
  },
  {
    id: "categories",
    heading: "2. The four categories",
    blocks: [
      { type: "table", head: ["Category", "What it does", "Your choice"], rows: [
        ["Necessary", "Keeps the site secure and working, remembers your consent, and keeps you signed in to the client portal during a session.", "Always on. The site cannot function without them, and Kenyan data protection law permits essential cookies without consent."],
        ["Functional", "Remembers preferences such as the insurance type you were comparing, so you do not have to re-enter it.", "Optional, on by default in the banner, changes take effect immediately."],
        ["Analytics", "Aggregate statistics about which pages and products are used, so we can improve the site.", "Optional, on by default in the banner. No financial or health data is ever included."],
        ["Marketing", "Measures whether our advertising reaches real Kenyan clients. We do not sell client data or upload client lists to advertising platforms.", "Optional, off by default. You must opt in."],
      ] },
    ],
  },
  {
    id: "necessary",
    heading: "3. Necessary cookies and storage",
    blocks: [
      { type: "table", head: ["Name", "Type", "Purpose", "Retention"], rows: [
        ["bib.cookie-consent", "Local storage", "Records which categories you accepted or refused, and when, so we can prove your consent and stop asking you on every visit.", "Until you clear your browser data, or 12 months, whichever comes first"],
        ["bib.loader.seen", "Session storage", "Stops the branded loading screen playing again on every page you open in the same visit.", "Until you close the tab"],
        ["bib.voice.played", "Session storage", "Stops the audio tour starting automatically more than once in the same visit.", "Until you close the tab"],
        ["authjs.session-token", "Cookie (HTTP-only, secure, same-site)", "Keeps you signed in to the client portal. Without it the portal cannot function.", "8 hours, or until you sign out"],
        ["authjs.csrf-token", "Cookie (HTTP-only)", "Protects your sign-in from cross-site request forgery.", "Session"],
        ["__Host-authjs.callback-url", "Cookie", "Remembers where to return you after signing in.", "Session"],
        ["_vercel_jwt (preview deployments only)", "Cookie", "Protects password-protected preview deployments. Not set on the live site.", "Session"],
      ] },
      {
        type: "note",
        text: "The portal session cookie contains only a signed token identifying your session. It does not contain your policy data. Policy data is fetched from our servers on each request and is never cached in your browser.",
      },
    ],
  },
  {
    id: "functional",
    heading: "4. Functional cookies and storage",
    blocks: [
      { type: "table", head: ["Name", "Type", "Purpose", "Retention"], rows: [
        ["bib.quote.draft", "Local storage", "If you start the quotation form and come back later on the same device, this holds the answers that are not yet submitted, so you do not start again.", "7 days from your last edit"],
        ["bib.compare.selection", "Local storage", "Remembers which insurers you selected in the comparison tool.", "30 days"],
        ["bib.pref.county", "Local storage", "Remembers your county so it is prefilled on forms.", "12 months"],
      ] },
      {
        type: "p",
        text: "None of these keys is sent to any third party, and none of them is required to submit a form or to use the portal. Refusing functional cookies simply means you re-enter preferences.",
      },
    ],
  },
  {
    id: "analytics",
    heading: "5. Analytics cookies",
    blocks: [
      {
        type: "p",
        text: "Analytics runs only if you leave Analytics switched on in the cookie banner. When it runs, it records aggregate information: the pages visited, the products compared, the county selected, the device type, and the referring site. It does **not** record your name, ID number, phone number, email address, health information, or any answer you typed into a form.",
      },
      { type: "table", head: ["Name", "Provider", "Purpose", "Retention"], rows: [
        ["Visitor identifier", "Our own first-party analytics", "Distinguishes unique visitors so figures are not inflated by repeat views.", "14 months, then deleted"],
        ["Session identifier", "Our own first-party analytics", "Groups page views into a visit so we can measure which pages lead to a quotation request.", "30 minutes of inactivity"],
      ] },
      {
        type: "p",
        text: "We do not enable cross-site advertising profiles, we do not sell analytics data, and we do not send any data to a third-party analytics provider that would combine it with information from other websites.",
      },
      {
        type: "note",
        text: "If you refuse analytics, the site behaves identically. Nothing is hidden from you and no form is disabled.",
      },
    ],
  },
  {
    id: "marketing",
    heading: "6. Marketing cookies",
    blocks: [
      {
        type: "p",
        text: "Marketing cookies are **off by default** and are set only if you switch them on. When enabled they tell us whether an advertising campaign resulted in a quotation request, so we do not keep spending money on advertising that reaches nobody. They are removed after 90 days.",
      },
      {
        type: "p",
        text: "We never upload client lists, policy data, or health information to an advertising platform. We do not use audience-matching tools on client data, and we do not use pixel tracking that profiles you across other websites you visit.",
      },
    ],
  },
  {
    id: "third-parties",
    heading: "7. Third parties that may set storage",
    blocks: [
      { type: "table", head: ["Provider", "When", "What it sets", "Their policy"], rows: [
        ["Google (reCAPTCHA)", "When a form loads or you submit one", "Cookies used to distinguish humans from automated submissions on our quotation, enquiry, claim, newsletter, and portal forms", "[Google privacy policy](https://policies.google.com/privacy)"],
        ["Google (Fonts)", "On page load", "No cookies. Font files are served from fonts.gstatic.com", "[Google privacy policy](https://policies.google.com/privacy)"],
        ["Vercel", "On page load", "Infrastructure and security cookies, including protection against abuse. No cookies are set for advertising", "[Vercel privacy policy](https://vercel.com/legal/privacy-policy)"],
        ["Cloudflare / jsDelivr (CDN)", "On page load", "Serves the icon font stylesheets. No tracking cookies are set by the stylesheet itself", "[jsDelivr privacy policy](https://www.jsdelivr.com/privacy-policy-jsdelivr-net)"],
        ["Google Maps", "Only on the contact page and the home page map", "Sets cookies when the embedded map loads", "[Google privacy policy](https://policies.google.com/privacy)"],
      ] },
      {
        type: "p",
        text: "Where a third party sets storage on our pages, we rely on the safeguards their terms provide, and we tell you here rather than burying it in a consent wall.",
      },
    ],
  },
  {
    id: "managing",
    heading: "8. How to accept, refuse, or withdraw consent",
    blocks: [
      { type: "ordered", items: [
        "**Use the banner.** On your first visit, choose **Accept All** or **Manage Preferences**, then switch Functional, Analytics, and Marketing on or off individually. Necessary stays on.",
        "**Change your mind later.** Scroll to the footer of any page and select **Cookie preferences**. Your new choice applies immediately, and the page reloads your settings.",
        "**Browser controls.** Every browser lets you block or delete cookies. Blocking necessary cookies will break the client portal sign-in and the consent record.",
        "**Device controls.** On iOS and Android you can limit tracking at the operating system level, which we respect.",
      ] },
      {
        type: "note",
        text: "Withdrawing consent does not affect the lawfulness of processing carried out before you withdrew it. If you have already unsubscribed from the newsletter and withdrawn Analytics consent, all that remains is the necessary consent record proving what you chose.",
      },
    ],
  },
  {
    id: "retention-consent",
    heading: "9. How long we keep the consent record",
    blocks: [
      {
        type: "p",
        text: "We keep a record of the consent choice itself, which is the date, the categories you selected, and a version number, for **12 months**. We need it to show that we asked, what we asked, and what you decided, which is what the Office of the Data Protection Commissioner expects. The record contains no policy or health information.",
      },
    ],
  },
  {
    id: "ira-compliance",
    heading: "10. IRA Kenya compliance note",
    blocks: [
      {
        type: "p",
        text: `${SITE.legalName} is licensed by the Insurance Regulatory Authority of Kenya under licence **${SITE.iraLicenseNumber}** and is a member of the Association of Kenya Insurers, ${SITE.akiMemberNumber}.`,
      },
      {
        type: "p",
        text: "Some records we hold are kept because the Insurance Act and IRA regulations require it, including records of the advice given and the cover placed. Cookies play no part in that obligation: the policy and claims records sit in our office systems and in Vercel KV, protected as described in our [Privacy Policy](/legal/privacy-policy). What cookies do is help a website work and help us measure it. No financial or health data is ever processed for analytics, marketing, or any advertising purpose.",
      },
      {
        type: "note",
        text: `Questions about this policy? Email ${SITE.email} or call ${SITE.phone}. To complain about how we handled your data, you may contact the Office of the Data Protection Commissioner, and for anything concerning our conduct as a broker, the Insurance Regulatory Authority of Kenya.`,
      },
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro="Every cookie and storage key this site sets, what each one does, how long it lasts, and how to change your mind at any time."
      updated="2025-10-01"
      sections={SECTIONS}
    />
  );
}
