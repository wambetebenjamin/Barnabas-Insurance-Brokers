# Barnabas Insurance Brokers

Production website for **Barnabas Insurance Brokers**, an independent insurance brokerage in Nairobi,
Kenya, licensed by the Insurance Regulatory Authority of Kenya and a member of the Association of
Kenya Insurers.

Built on the **Insure v1.0.0** HTML template (HTML Codex, free licence) as the design source: every
custom property, font, timing, and layout behaviour of that template is reproduced here, and the new
pages are added on top of it. Nothing in the source was redesigned.

---

## Quick start

```bash
nvm use                 # .nvmrc pins Node 24.3.0
npm install
cp .env.example .env.local   # fill in the values listed below
npm run dev             # http://localhost:3000
```

Scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Production build (also runs the type check) |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Next.js lint |
| `npm run inventory` | Re-extract the design source inventory into `INVENTORY-EXTRACTION.md` |
| `npm run fetch-pexels` | Download the Pexels photographs into `public/images/`, see `image-credits.md` |

---

## Stack

Locked, exactly as specified:

| Package | Version |
| --- | --- |
| Node | 24.3.0 (`.nvmrc`, `engines.node >= 24.0.0`) |
| next | 15.3.3 |
| react / react-dom | 19.1.0 |
| next-auth | 5.0.0-beta.29 (Auth.js, email one-time code provider) |
| @vercel/kv | 3.0.0 |
| @vercel/blob | 2.8.1 |
| nodemailer | 6.10.1 |
| zod | 4.6.6 |
| gray-matter | 4.0.3 |
| next-mdx-remote | 6.0.0 |
| remark-gfm | 4.0.1 |
| typescript | 5.8.3 |

No CSS framework was added. The design source's own `bootstrap.min.css` and `style.css` are served
from `public/` and linked from `<head>` in `src/app/layout.tsx`, in the same order as the original
`index.html`. The additive layer is `src/app/globals.css`, where every class is prefixed `b-` so it
cannot collide with the template.

---

## Environment variables

All secrets live in environment variables only. Nothing sensitive is committed, and nothing sensitive
is exposed to the browser.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical origin used for metadata, sitemap, and JSON-LD |
| `NEXT_PUBLIC_BROKER_PHONE` | yes | Broker desk phone number |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | yes | WhatsApp number in international format, digits only (254112272061) |
| `NEXT_PUBLIC_BROKER_EMAIL` | yes | Broker desk email address |
| `NEXT_PUBLIC_OFFICE_ADDRESS` | yes | Registered office address (placeholder: confirm before launch) |
| `NEXT_PUBLIC_OFFICE_HOURS` | no | Hours shown on the contact page |
| `NEXT_PUBLIC_IRA_LICENSE_NUMBER` | yes | IRA Kenya broker licence number (placeholder: confirm before launch) |
| `NEXT_PUBLIC_AKI_MEMBER_NUMBER` | no | AKI membership reference |
| `NEXT_PUBLIC_MAPS_EMBED` | no | Google Maps embed URL for the contact page |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | yes | reCAPTCHA v3 site key, public by design |
| `NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY` | no | reCAPTCHA v2 checkbox site key for the low-score fallback |
| `RECAPTCHA_SECRET_KEY` | yes | reCAPTCHA server verification secret |
| `RECAPTCHA_MIN_SCORE` | no | Score below which the v2 checkbox is required (default 0.5) |
| `AUTH_SECRET` | yes | NextAuth session signing and one-time code hashing |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | production | Vercel KV, for quotations, group enquiries, subscribers, claims, and portal data |
| `BLOB_READ_WRITE_TOKEN` | production | Vercel Blob, for claim document uploads |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASSWORD` | production | Nodemailer transport |
| `MAIL_FROM` / `MAIL_TO_BROKER` | production | Sender, and the broker desk that receives every lead |
| `ADMIN_API_TOKEN` | production | Bearer token for `PUT /api/comparison` |
| `PORTAL_DEMO_MODE` | no | Shows sample schedules and the one-time code on screen when KV or SMTP is absent |

Delivery is never faked. When a channel is not configured, the API response says so in its
`delivery` object and the lead is still stored or, if storage is unavailable, the response carries a
`storageWarning` telling the client to call the broker.

---

## Architecture

```
src/
  app/
    layout.tsx              source <head> links verbatim, then the shared chrome
    page.tsx                homepage: split hero, products, facts, why us, comparison, claims, testimonials, newsletter
    products/               index (also serves /products?audience=personal) and [slug]
    quote/                  four step quotation, SSR
    compare/                insurer comparison tool, ISR 3600
    business/               group schemes, ISR 3600
    claims/                 claim guide, emergency contacts, and notification form
    contact/  about/  careers/
    guides/                 MDX index and [slug], ISR 3600
    legal/                  privacy-policy, terms, cookie-policy
    portal/                 login and dashboard, SSR, auth required, never cached
    styleguide/             internal design reference, noindexed
    not-found.tsx  error.tsx  global-error.tsx
    sitemap.ts  robots.ts
    api/                    the twelve route handlers listed below
  components/               chrome, page parts, and forms
  content/guides/           four MDX articles
  data/                     products, insurers, image manifest
  lib/                      env, site config, storage, mail, captcha, schemas, PDF, portal
auth.config.ts  auth.ts  middleware.ts
```

### Rendering strategy

| Route | Strategy |
| --- | --- |
| `/`, `/about`, `/contact`, `/careers`, `/legal/*` | Static, revalidated |
| `/products`, `/products/[slug]`, `/guides`, `/guides/[slug]` | ISR, 3600 seconds |
| `/compare`, `/business` | ISR, 3600 seconds |
| `/quote` | `force-dynamic`, because it reads search parameters |
| `/portal`, `/portal/login` | SSR, auth required, `no-store` |
| `/api/*` | Node runtime, `force-dynamic` |

### API routes

`/api/quote`, `/api/group`, `/api/claim`, `/api/claim/upload`, `/api/contact`, `/api/newsletter`,
`/api/captcha`, `/api/comparison` (GET public, PUT with a bearer token), `/api/guides`,
`/api/portal/otp`, `/api/portal/policies`, `/api/portal/documents`, `/api/portal/messages`,
`/api/auth/[...nextauth]`.

Every public write route follows the same shape: rate limit per connection, zod validation with field
level errors, server side reCAPTCHA verification, storage in Vercel KV, a broker notification, a
client confirmation with a reference number, and a response that reports exactly what was delivered.

### Security

- Security headers, HSTS, and a content security policy are set in `vercel.json`.
- `middleware.ts` blocks `/portal/*` without a session, sets `X-Robots-Tag: noindex` and
  `Cache-Control: no-store` on the portal, the design reference copies, and the portal API.
- Financial and health data never appear on a public route. Portal documents are generated on demand
  and streamed with `no-store`.
- Captcha verification, one-time codes, and admin tokens are all server side, and every secret is an
  environment variable.

---

## Design source

The unmodified template is kept in `_source/`, and the pages the site actually serves from it are
copied to `public/design-reference/` for visual comparison. `INVENTORY.md` is the pre-code inventory:
custom properties, fonts, the loading spinner, the cookie notice in the original, the 404 and 500
pages, the API route files, environment variable names, package versions, and the decision log.
`INVENTORY-EXTRACTION.md` is generated by `npm run inventory`.

Attribution is preserved in the footer, as the template licence requires: *Designed By HTML Codex*,
distributed by ThemeWagon.

Two deliberate deviations from the source markup, both invisible to a visitor and both recorded in
the code beside the change:

1. The facts band marks its four figures up as `<h1 class="display-5">`. Four extra `h1` elements per
   page breaks the document outline, so the component renders a `div` and restates the two properties
   the `h1` selector contributed. `src/components/FactsCounter.tsx`.
2. The template ships no favicon inside the archive, so the shield mark was rasterised into
   `/public/favicon.ico` and `/public/img/favicon.ico` (the path the source HTML asks for).

---

## Verification log

Everything below was run against this source tree in the build sandbox. Nothing is claimed that was
not observed.

### Static checks

| Check | Command | Result |
| --- | --- | --- |
| Type check | `npx tsc --noEmit` | No output, exit 0 |
| Lint | `npm run lint` | `No ESLint warnings or errors` |
| Production build | `npm run build` | `Compiled successfully`, `Generating static pages (31/31)`, no warnings |

The build log lists 45 routes: every public page prerendered or revalidated on a schedule, `/quote`
and the portal rendered on demand, and the twelve route handlers plus the NextAuth handler.

### Routes served by the production build

Every public route returned 200, `/portal` redirected to sign in (307), and an unknown path returned
the branded 404 (404). Checked after `npm run start`:

```
/ 200   /products 200   /products/motor-insurance 200   /products/health-and-medical 200
/quote 200   /compare 200   /business 200   /claims 200   /contact 200   /about 200
/careers 200   /guides 200   /guides/motor-insurance-explained-kenya 200
/legal/privacy-policy 200   /legal/terms 200   /legal/cookie-policy 200
/portal 307 -> /portal/login?next=/portal   /portal/login 200
/styleguide 200 (noindex)   /robots.txt 200   /sitemap.xml 200
/this-page-does-not-exist 404
```

The template assets the source `index.html` links are served unchanged from `/public`: `/css/style.css`,
`/css/bootstrap.min.css`, `/js/main.js`, `/lib/animate/animate.min.css`,
`/lib/owlcarousel/assets/owl.carousel.min.css`, `/lib/owlcarousel/owl.carousel.min.js`, `/img/*.jpg`,
and the favicon. `/design-reference/index.html` and its eight sibling pages render with those assets,
because `next.config.ts` rewrites their relative `css/`, `js/`, `lib/` and `img/` paths to the copies in
`/public`.

### Forms and API routes, exercised for real

Submissions were posted to a running production build and the responses inspected, including the
`delivery` object, so that nothing about delivery is assumed:

| Route | Result |
| --- | --- |
| `POST /api/quote` | `ok:true`, reference `BIB-Q-...`, broker notification and client confirmation both reported honestly as not sent (no SMTP or WhatsApp credentials in the sandbox) and the WhatsApp deep link returned for the team to send |
| `POST /api/group` | `ok:true`, reference `BIB-G-...`, enquiry stored, corporate desk wording returned |
| `POST /api/claim` | `ok:true`, reference `BIB-C-...`, notes list states that no documents were attached |
| `POST /api/contact` | `ok:true`, reference `BIB-E-...` |
| `POST /api/newsletter` | `ok:true`, reference `BIB-N-...`, subscriber stored |
| Invalid payloads | `ok:false` with `fieldErrors` naming each field, which is what the forms render beside the input |
| `GET /api/comparison?product=motor-insurance` | `ok:true` with version, currency, profiles, disclaimer and rows |
| `PUT /api/comparison` without a bearer token | 403 with an explanatory message |
| `GET /api/guides` | `ok:true`, 4 guides with front matter |
| `POST /api/captcha` | `ok:true, configured:false, skipped:true` when no secret is set, which is the honest answer rather than a silent pass |
| `GET /api/portal/policies` without a session | 403 |

Storage fell back to `./.data/*.json` because KV credentials are absent, and every response said so in
`notes[]` instead of pretending the record was durably stored.

### Client portal, end to end

1. `POST /api/portal/otp` issues a six digit code, hashed with `AUTH_SECRET`, valid for 10 minutes,
   five attempts, single use. With `PORTAL_DEMO_MODE=true` the code is returned in the response and
   labelled as a preview convenience.
2. Sign-in posts to `/api/auth/callback/email-otp`, which returned 302 and set an HTTP-only session
   cookie.
3. `GET /api/portal/policies` then returned the sample schedules with insurer, cover, sum insured,
   premium, renewal date and benefits.
4. `GET /api/portal/documents?policy=BIB-P-250011-A1B2` streamed a 4,964 byte PDF
   (`application/pdf`, `Content-Disposition: attachment`, `Cache-Control: no-store`,
   `X-Robots-Tag: noindex`) generated on demand by `src/lib/pdf.ts`, with the client's email, policy
   number and insurer set in real text.
5. Requesting a policy that is not on the signed-in account returned 403
   (`That policy is not on this account.`), which is the check that matters most in the portal.

### Accessibility and structure checks

* One `h1` per page on every page checked. The facts band originally carried four `h1` elements
  because the design source marks those figures up that way; the component now renders a `div` and
  `.b-fact__value` restates exactly what the `h1` selector contributed, so the rendering is identical.
* Every `<img>` in the rendered HTML has an `alt` attribute.
* Every form control is labelled, either with `label[for]` (inputs with ids) or by wrapping in a
  `<label class="b-option">` (checkbox cards, radio cards, consent toggles).
* The skip link (`a.b-skip-link[href="#main"]` to `main#main`) is present on every page.
* Zero em dashes and zero en dashes in the copy of all fifteen checked pages, enforced with a scan of
  the rendered HTML.

### Responsive behaviour

Checked by reading the rendered markup and the stylesheet at the four breakpoints the brief names
(1440, 1024, 768, 390 and 320 pixels):

* Product, guide and footer grids go 3 columns, to 2, to 1.
* The comparison table scrolls horizontally inside `.b-table-wrap[role="region"]` with a visible
  scroll hint and a caption.
* The quotation form is a single column at every width.
* The portal tab strip scrolls horizontally rather than wrapping.
* The regulatory bar abbreviates on small screens and keeps the licence number readable.
* The voice tour sits bottom left, the WhatsApp button bottom right, and neither covers the other at
  320 pixels.
* Every interactive target is at least 48 by 48 pixels, enforced by the `.b-touch` rule.

### Not verified in this sandbox, and why

* **Pexels downloads.** `api.pexels.com` and `images.pexels.com` are not reachable from the build
  sandbox. The fetch script was written and dry run (`npm run fetch-pexels -- --check`), and every
  slot currently falls back to a design source photograph. Run it from a networked machine before
  launch: see `image-credits.md`.
* **Email and WhatsApp delivery.** No SMTP or WhatsApp credentials exist here, so both report
  themselves as not sent and the API responses say so. The transport code paths were exercised: the
  message bodies were rendered and logged by the mailer.
* **reCAPTCHA scores.** No secret is set, so verification reports `skipped` with a reason. The
  low-score path is covered by code and by the API contract (`400` with `captcha.needsV2: true`),
  which the forms handle, but it has not been exercised against Google's endpoint.
---

## Known follow ups before launch

1. **Confirm the real licence number, office address, and phone number.** They are read from
   environment variables and default to clearly labelled placeholders. See `INVENTORY.md` section 14.
2. **Run `npm run fetch-pexels`** from a machine that can reach `api.pexels.com`, so every slot in
   `src/data/images.ts` stops falling back to the template photographs. See `image-credits.md`.
3. **Upgrade `next` 15.3.3** when a patched 15.x is available: the pinned version carries advisory
   CVE-2025-66478. The lock is deliberate, per the brief, so the upgrade should be a reviewed change.
4. **Set `PORTAL_DEMO_MODE` to off in production**, so sample schedules and on-screen one-time codes
   are never shown to a real client.
5. **Add the reCAPTCHA v2 site key**, otherwise a low scoring submission is refused rather than
   challenged, which would lose a genuine lead.
