/**
 * Internal design reference (brief: no redesign of the source, so this page exists
 * to prove the point).
 *
 * It renders the tokens and the type scale exactly as extracted from the design
 * source, next to the additive `b-` layer, so the broker team and any future
 * developer can see what came from the template and what was added. It is
 * noindexed, disallowed in robots.txt, and not linked from the navigation.
 */
import Link from "next/link";
import type { Metadata } from "next";

import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Design reference | Barnabas Insurance Brokers",
  description: "Internal reference: the design source tokens, the type scale, and the additive component layer.",
  robots: { index: false, follow: false, nocache: true },
};

const SOURCE_TOKENS = [
  { name: "--primary", value: "#015FC9", use: "Brand blue: headings emphasis, buttons, links, icons" },
  { name: "--secondary", value: "#0DD3F1", use: "Cyan accent: hover states, secondary buttons, ticks" },
  { name: "--light", value: "#F6F7FC", use: "Section backgrounds, form fields, cookie banner" },
  { name: "--dark", value: "#15233C", use: "Headings, navbar on scroll, footer" },
];

const TYPE_SCALE = [
  { tag: "body", size: 16, floor: 15, note: "Source body text. Floor enforced with max() so it never drops below 15px." },
  { tag: "h6", size: 16, floor: 15, note: "Used for small headings and card labels." },
  { tag: "h5", size: 20, floor: 18, note: "Card titles, portal policy names." },
  { tag: "h4", size: 24, floor: 21, note: "Section subheadings, CTA band titles." },
  { tag: "h3", size: 28, floor: 24, note: "Section headings." },
  { tag: "h2", size: 32, floor: 26, note: "Section titles with the source’s two-tone rule." },
  { tag: "h1", size: 40, floor: 30, note: "Page titles and the split hero headline." },
  { tag: "nav", size: 16, floor: 13, note: "Navbar links. Floor 13px as the brief requires." },
  { tag: "button", size: 16, floor: 12, note: "Bootstrap button font size. Floor 12px as the brief requires." },
  { tag: "metadata", size: 13, floor: 11, note: "Breadcrumbs, table captions, legal footnotes, meta lines." },
];

const BEHAVIOURS = [
  { name: "Loading screen", detail: "Derived from the source’s #spinner.show. Shield draws on, wordmark fades in, progress bar runs, then it lifts. Skipped after 3s of any preference for reduced motion." },
  { name: "Reveals on scroll", detail: "WOW.js timings from js/main.js, reimplemented in Reveal.tsx with IntersectionObserver. Same animation names and durations." },
  { name: "Sticky navbar", detail: "Source behaviour: .sticky-top applied after 300px of scroll, with the same box shadow." },
  { name: "Back to top", detail: "Source behaviour: fades in after 300px, scrolls with a 1500ms easeInOutExpo curve." },
  { name: "Facts counters", detail: "counterUp configuration from the source: delay 10, time 2000." },
  { name: "Testimonials carousel", detail: "Owl Carousel configuration from the source: autoplay, smartSpeed 1000, loop, nav, single item on mobile." },
];

export default function StyleguidePage() {
  return (
    <>
      <PageHeader
        title="Design Reference"
        intro="Internal page. It shows the tokens and behaviours taken from the Insure v1.0.0 design source, and the additive layer built on top of it."
        crumbs={[]}
      />

      <section className="b-section">
        <div className="container">
          <div className="b-alert b-alert--info" style={{ marginBottom: 32 }}>
            <i className="bi bi-info-circle" aria-hidden="true" />
            <span>
              Nothing on this page is part of the client facing site. It is here so that a future
              developer can see what came from the template, what was added, and why. The real pages
              never appear in a search result for it: it is noindexed and blocked in robots.txt.
            </span>
          </div>

          <h2 className="h3 mb-3">Colour tokens</h2>
          <p className="b-lead" style={{ maxWidth: "70ch" }}>
            Four custom properties, reproduced from <code>:root</code> in the design source with their
            original values. Everything else in the additive layer is an alias of one of these.
          </p>
          <div className="b-table-wrap" role="region" aria-label="Colour tokens" tabIndex={0}>
            <table>
              <caption>Source custom properties and where they are used</caption>
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Value</th>
                  <th scope="col">Preview</th>
                  <th scope="col">Where it is used</th>
                </tr>
              </thead>
              <tbody>
                {SOURCE_TOKENS.map((token) => (
                  <tr key={token.name}>
                    <td>
                      <code>{token.name}</code>
                    </td>
                    <td>
                      <code>{token.value}</code>
                    </td>
                    <td>
                      <span
                        aria-hidden="true"
                        style={{
                          display: "inline-block",
                          width: 64,
                          height: 26,
                          borderRadius: 4,
                          background: token.value,
                          border: "1px solid rgba(0,0,0,.12)",
                        }}
                      />
                    </td>
                    <td>{token.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="h3 mb-3" style={{ marginTop: 48 }}>
            Type scale
          </h2>
          <p className="b-lead" style={{ maxWidth: "70ch" }}>
            Taken from the source stylesheet, with the brief&apos;s minimum sizes enforced through
            <code> max() </code> so they hold at every breakpoint. Body text never falls below 15px,
            metadata never below 11px, navigation never below 13px, buttons never below 12px.
          </p>
          <div className="b-table-wrap" role="region" aria-label="Type scale" tabIndex={0}>
            <table>
              <caption>Source sizes, floors, and the reason for each</caption>
              <thead>
                <tr>
                  <th scope="col">Element</th>
                  <th scope="col">Source size</th>
                  <th scope="col">Floor</th>
                  <th scope="col">Preview</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {TYPE_SCALE.map((row) => (
                  <tr key={row.tag}>
                    <td>
                      <code>{row.tag}</code>
                    </td>
                    <td>{row.size}px</td>
                    <td>{row.floor}px</td>
                    <td>
                      <span
                        style={{
                          fontFamily: row.tag.startsWith("h") ? "Poppins, sans-serif" : "Roboto, sans-serif",
                          fontSize: row.size,
                          fontWeight: row.tag.startsWith("h") ? 600 : 400,
                          color: row.tag.startsWith("h") ? "var(--b-dark)" : "inherit",
                        }}
                      >
                        Right cover, right price
                      </span>
                    </td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="h3 mb-3" style={{ marginTop: 48 }}>
            Behaviours carried over from the source
          </h2>
          <div className="b-grid-2">
            {BEHAVIOURS.map((behaviour) => (
              <div className="b-policy" key={behaviour.name}>
                <h3 style={{ fontSize: 17 }}>{behaviour.name}</h3>
                <p className="b-fs-body-sm mb-0">{behaviour.detail}</p>
              </div>
            ))}
          </div>

          <h2 className="h3 mb-3" style={{ marginTop: 48 }}>
            Additive components
          </h2>
          <p className="b-lead" style={{ maxWidth: "70ch" }}>
            Every class below is prefixed <code>b-</code> so it can never collide with the source
            stylesheet. They exist because the brief needs patterns the template does not ship:
            regulatory bar, quote wizard, portal, cookie preferences, loading screen, voice tour, and
            the Kenyan legal pages.
          </p>

          <div className="d-flex flex-wrap gap-2 mb-4">
            <button type="button" className="btn btn-primary">
              Primary button
            </button>
            <button type="button" className="btn b-btn-ghost">
              Ghost button
            </button>
            <span className="b-pill b-pill--active">Active</span>
            <span className="b-pill b-pill--due">Renews in 14 days</span>
            <span className="b-pill b-pill--lapsed">Lapsed</span>
          </div>

          <div className="b-alert b-alert--info mb-3" role="status">
            <i className="bi bi-info-circle" aria-hidden="true" />
            <span>Information alert, used for status messages the client needs to read.</span>
          </div>
          <div className="b-alert b-alert--ok mb-3" role="status">
            <i className="bi bi-check-circle-fill" aria-hidden="true" />
            <span>Success alert, used when a submission has been received.</span>
          </div>
          <div className="b-alert b-alert--error mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
            <span>Error alert, used when a form cannot be sent.</span>
          </div>

          <div className="b-policy" style={{ marginBottom: 24 }}>
            <div className="b-policy__top">
              <div>
                <h3>Policy card</h3>
                <p className="b-meta mb-0" style={{ color: "var(--b-ink-muted)" }}>
                  Jubilee Health Insurance &middot; BIB-P-250011-A1B2
                </p>
              </div>
              <span className="b-pill b-pill--due">Renews in 14 days</span>
            </div>
            <p className="b-fs-body-sm">
              Used in the client portal and on the 404 page. Everything inside it is real text, so it
              reads correctly to a screen reader and prints without colour.
            </p>
            <dl>
              <dt>Sum insured</dt>
              <dd>KSh 5,000,000</dd>
              <dt>Renewal date</dt>
              <dd>25 October 2025</dd>
            </dl>
          </div>

          <p className="b-legal-note">
            Licence details shown throughout the site are read from environment variables: IRA licence{" "}
            {SITE.iraLicenseNumber}, AKI membership {SITE.akiMemberNumber}. Replace the placeholders in
            the Vercel dashboard before launch, per INVENTORY.md section 14.
          </p>

          <p className="mt-4 mb-0">
            <Link href="/">Back to the homepage</Link>
          </p>
        </div>
      </section>
    </>
  );
}
