# INVENTORY.md — Barnabas Insurance Brokers

**Design source:** `insure-v1.0.0.zip` — *"Insure - Insurance HTML Template"* v1.0.0 by HTML Codex
(license: Free HTML Template License by HTML Codex, see `_source/LICENSE.txt`).
**Status:** unpacked to `_source/` (149 files, 1,336,377 bytes), fully inventoried, then extended.
**Exhaustive machine-readable dump:** [`INVENTORY-EXTRACTION.md`](./INVENTORY-EXTRACTION.md) (regenerate with `npm run inventory`).

This document is written before any new code, as required. Nothing here is inferred: every value was
read out of the archive. Where a value is *absent* from the archive it is stated as absent and the
specified replacement is recorded in the decision log (§10).

---

## 1. Full file tree of the ZIP

```
404.html   LICENSE.txt   READ-ME.txt   about.html   appointment.html   contact.html
feature.html   index.html   insurance-html-template.jpg   service.html   team.html   testimonial.html
css/          bootstrap.min.css (164,174 B)   style.css (8,651 B)
img/          about.jpg carousel-1.jpg carousel-2.jpg feature.jpg profile.jpg
              team-1..4.jpg  testimonial-1..3.jpg
img/icon/     icon-01..10-light.png  icon-01..10-primary.png  (20 files)
js/           main.js (1,461 B)
lib/animate/  animate.css  animate.min.css
lib/counterup/counterup.min.js
lib/easing/   easing.js  easing.min.js
lib/owlcarousel/  LICENSE  owl.carousel(.min).css  owl.carousel(.min).js  owl.theme.default(.min).css
                  owl.theme.green(.min).css  owl.video.play.png  assets/ajax-loader.gif
lib/waypoints/   links.php  waypoints.min.js
lib/wow/         wow.js  wow.min.js
scss/bootstrap/  bootstrap.scss + scss/ (full Bootstrap 5.0.0 source: 60 partials, 27 mixins, 5 forms,
                 5 helpers, 1 utility api, vendor/_rfs.scss)
```

Reproduced verbatim into this project at **byte-identical** copies (md5 verified):

| source | destination | md5 |
| --- | --- | --- |
| `css/style.css` | `public/css/style.css` | `9265eee4aeabc08686c50d7dd8b983b7` |
| `css/bootstrap.min.css` | `public/css/bootstrap.min.css` | `049228f6c378c325b324d11f9da27309` |
| `js/main.js` | `public/js/main.js` | `b232103add3051435bf58c4a04683c36` |
| `img/**`, `lib/**` | `public/img/**`, `public/lib/**` | copied 1:1 |
| all `*.html` | `public/design-reference/*.html` | copied 1:1 (served as an unmodified reference) |

The `scss/` tree and the original HTML pages remain in `_source/` untouched as the archival reference.

---

## 2. Every CSS custom property in the source

### 2.1 `css/style.css` → `:root` — the four design tokens, verbatim

```css
:root {
    --primary: #015FC9;
    --secondary: #0DD3F1;
    --light: #F6F7FC;
    --dark: #15233C;
}
```

| token | value | where the source consumes it |
| --- | --- | --- |
| `--primary` | `#015FC9` | `.btn-primary:hover`, `.navbar .nav-link:hover/.active`, `.carousel-control-*-icon`, `.page-header` + `.appointment` overlay (as `rgba(1, 95, 201, .9)`), `.container.facts .facts-text` overlay, `.service-item a.btn`, `.team-item a.btn`, `.testimonial-left img` dashed border, `.testimonial-carousel .owl-nav` |
| `--secondary` | `#0DD3F1` | `.btn-primary:hover` background, `.btn-secondary` base, `.testimonial-carousel .owl-nav .owl-*:hover`, `.footer .copyright a` |
| `--light` | `#F6F7FC` | text colour on `.footer .btn.btn-link:hover`, `.footer .btn.btn-square:hover` border |
| `--dark` | `#15233C` | `bg-dark` surfaces: top bar, footer, back-to-top hover |

These 4 tokens plus 36 distinct `--bs-*` properties are listed exhaustively in
`INVENTORY-EXTRACTION.md` §2. There are **no other custom properties** in the archive.

### 2.2 `css/bootstrap.min.css` → `:root` (compiled Bootstrap 5.0.0, brand-theme recompiled)

```css
:root{
  --bs-blue:#0d6efd; --bs-indigo:#6610f2; --bs-purple:#6f42c1; --bs-pink:#d63384;
  --bs-red:#dc3545; --bs-orange:#fd7e14; --bs-yellow:#ffc107; --bs-green:#198754;
  --bs-teal:#20c997; --bs-cyan:#0dcaf0; --bs-white:#fff; --bs-gray:#6c757d; --bs-gray-dark:#343a40;
  --bs-primary:#015FC9;  --bs-secondary:#0DD3F1; --bs-success:#198754; --bs-info:#0dcaf0;
  --bs-warning:#ffc107;  --bs-danger:#dc3545;    --bs-light:#F6F7FC;   --bs-dark:#15233C;
  --bs-font-sans-serif: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial,
     "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", ...;
  --bs-font-monospace: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  --bs-gradient: linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0));
}
```

**Decision:** `--bs-primary/secondary/light/dark` were recompiled by the template author to the same
four brand colours. Because `css/bootstrap.min.css` ships pre-themed, this build links the archive's
own compiled Bootstrap and `style.css` from `<head>` **exactly as the source does**, so the cascade
order and every resolved value are identical to the design source. No Tailwind, no CSS reset, no
preflight: nothing is re-derived.

---

## 3. Every `@font-face` rule in the ZIP

**There are none.** `css/style.css` contains zero `@font-face` rules; `css/bootstrap.min.css`
contains zero; no other stylesheet in the archive declares one. Fonts are therefore *not* vendored —
they are requested from Google Fonts at runtime, and the only two `font-family` declarations inside
`style.css` are icon-font references:

```css
font-family: "Font Awesome 5 Free";   /* style.css line 107 — .navbar .dropdown-toggle::after */
font-family: "Font Awesome 5 Free";   /* style.css line 437 — .footer .btn.btn-link::before  */
```

Font loading is reproduced **verbatim** in `src/app/layout.tsx`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css" rel="stylesheet" />
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css" rel="stylesheet" />
<link href="/lib/animate/animate.min.css" rel="stylesheet" />
<link href="/lib/owlcarousel/assets/owl.carousel.min.css" rel="stylesheet" />
<link href="/css/bootstrap.min.css" rel="stylesheet" />
<link href="/css/style.css" rel="stylesheet" />
```

Icon-font class usage found in the markup (must all still resolve):
`fa fa-phone-alt`, `far fa-envelope-open`, `far fa-clock`, `fa fa-map-marker-alt`, `fa fa-envelope`,
`fab fa-facebook-f/twitter/linkedin-in/instagram/youtube`, `bi bi-chevron-left`, `bi bi-chevron-right`,
`bi bi-arrow-up`.

---

## 4. Typography, verbatim, and the floors required by the brief

`html` font size is never overridden, so `1rem = 16px`.

| element | declaration as compiled in the source | resolved |
| --- | --- | --- |
| `body` | `font-family:"Roboto",sans-serif; font-size:1rem; font-weight:400; line-height:1.5; color:#696E77` | 16px |
| `h1` | `font-family:"Poppins",sans-serif; font-weight:600; line-height:1.2` + `font-size:2.5rem` | 40px |
| `h2` | …`font-size:2rem` | 32px |
| `h3` | …`font-size:1.75rem` | 28px |
| `h4` | …`font-size:1.5rem` | 24px |
| `h5` | …`font-size:1.25rem` | 20px |
| `h6` | …`font-size:1rem` | 16px |
| `.display-1…6` | `font-family:Poppins; font-weight:700; line-height:1.2` at `5/4.5/4/3.5/3/2.5rem` | 80–40px |
| `.lead` | `font-size:1.25rem; font-weight:300` | 20px |
| `.small`, `small` | `font-size:.875em` | 14px |
| `.btn` | `font-size:1rem` (Bootstrap base) + `transition:.5s` (style.css) | 16px |
| `.navbar .nav-link` | `margin-left:25px; padding:10px 0; color:#696E77; font-weight:500` — **no `font-size`**, inherits 1rem | 16px |
| `.footer .copyright` | `padding:25px 0; font-size:15px` | 15px |
| top-bar `small` | inherits `.small` → 14px | 14px |

**Floors required by the brief vs. the source — all satisfied, nothing changed:**

| requirement | source value | verdict |
| --- | --- | --- |
| body 15px minimum | 16px | ✅ kept verbatim |
| navigation 13px | 16px | ✅ kept verbatim |
| buttons 12px | 16px | ✅ kept verbatim |
| metadata 11px minimum | *new element* (badges, credits, license text) | enforced with `max(11px, …)` |

The floors are enforced programmatically in `src/app/globals.css` (`--b-*` floor tokens + `max()`
guards), so no new component this build adds can render below them. Nothing from the source was changed.

---

## 5. Element-by-element inventory of the source (all reproduced, none redesigned)

| # | element | source location | reproduced as |
| --- | --- | --- | --- |
| 1 | **Loading screen** `#spinner` | every page, `<div id="spinner" class="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center"><div class="spinner-grow text-primary" role="status"></div></div>`; dismissed on next tick by `js/main.js`; CSS `#spinner{opacity:0;visibility:hidden;transition:opacity .5s ease-out, visibility 0s linear .5s;z-index:99999}` / `#spinner.show{…}` | `src/components/LoadingScreen.tsx` — white full-viewport overlay, same class contract, `role="status"`, extended per §16.2 of the brief |
| 2 | **Top bar** | `container-fluid bg-dark text-white-50 py-2 px-0 d-none d-lg-block`, phone / email / hours left, 4 social icons right | `RegulatoryBar` + `TopBar` — regulatory bar above the navbar per brief §1, contact/social row retained |
| 3 | **Navbar** | `navbar navbar-expand-lg bg-white navbar-light sticky-top px-4 px-lg-5`; brand = `img/icon/icon-02-primary.png` + `<h1>Insure</h1>`; centre `navbar-nav mx-auto bg-light rounded pe-4 py-3 py-lg-0`; right `btn btn-primary px-3` "Get A Quote"; dropdown "Pages" | `Navbar.tsx` — same classes, brand = shield icon + "Barnabas Insurance" wordmark, 7 nav items + CTA, mobile full-screen overlay |
| 4 | **Sticky behaviour** | `js/main.js`: `scroll > 300` → add `shadow-sm`, `top:0`; else remove and `top:-100px`; CSS `.navbar.sticky-top{top:-100px;transition:.5s}` | `Navbar.tsx` — identical thresholds, identical classes, plus solid background on scroll per brief §2 |
| 5 | **Carousel header** | `#header-carousel` Bootstrap carousel, 2 slides, `carousel-caption` flex-centred, `.display-3 text-dark` + `animated slideInDown`; round `carousel-control-*-icon` 3rem with 15px `--primary` border | CSS retained verbatim in `style.css`; the demo slider itself is replaced by the brief-specified split hero (§10 item 2). Original markup preserved in `public/design-reference/index.html` |
| 6 | **Page header** | `.page-header` background `url(../img/carousel-1.jpg) center center no-repeat` + Bootstrap breadcrumb, `.breadcrumb-item a` colour `#696E77`, `:hover/.active` `--primary` | `PageHeader.tsx` — used on every inner page (products, quote, business, claims, portal, guides, legal, 404) |
| 7 | **Facts counters** | `.container.facts` full-bleed with `calc(((100% - 1320px)/2) + .75rem)` padding, blue overlay `rgba(1,95,201,.9)` + white overlay, `data-toggle="counter-up"` on `h1.display-5`, `counterUp({delay:10,time:2000})` | `FactsCounter.tsx` — same classes, same 10ms/2000ms animation, four trust numbers |
| 8 | **Service / product item** | `.service-item` (`box-shadow: 0 0 45px rgba(0,0,0,.07)`, `overflow:hidden`), `.service-icon` 90×90 with `max-width:60px` icon, `a.btn` coloured `--primary` | `ProductCard.tsx` — 6 products, same card classes, hover border accent + shadow lift 250ms per brief §4 |
| 9 | **Appointment section** | `.appointment` background = `linear-gradient(rgba(1,95,201,.9), rgba(1,95,201,.9)), url(../img/carousel-1.jpg)`; "Call Us: +012 345 6789" | reused for the quotation CTA band on the home page and `/business` |
| 10 | **Team item** | `.team-item` card, `img` scale(1.1) on hover, `.team-text` absolute `bottom:-50px` → `0` opacity 0 → 1 | `TeamCard.tsx` on `/about` |
| 11 | **Testimonials** | `.testimonial-left/right` floating dashed-border avatars (70/60/50px), Owl Carousel 1 item, autoplay, `smartSpeed:1000`, loop, nav with `bi bi-chevron-*`, `.owl-nav` buttons 45×45 radius 10px `--primary` → `--secondary` hover | `Testimonials.tsx` — same sizes/radius/colours, staggered scroll reveal per brief §12 |
| 12 | **Footer** | `.container-fluid bg-dark footer mt-5 pt-5` → 4 columns (brand + 4 social `btn-square`, Address, Quick Links as `.btn.btn-link` with `::before` `\f105` chevron, Newsletter with absolutely-positioned `btn-secondary` "SignUp"); `.copyright` 25px padding, `font-size:15px`, top border `rgba(256,256,256,.1)`, link `--secondary` → `#FFFFFF` | `Footer.tsx` — same structure/classes, expanded link groups per brief §15, attribution preserved |
| 13 | **Back to top** | `a.btn.btn-lg.btn-primary.btn-lg-square.back-to-top` (48×48), `fixed right:30px bottom:30px z-index:99`, fade in after 300px, `animate({scrollTop:0}, 1500, 'easeInOutExpo')` | `BackToTop.tsx` — same geometry, same 1500ms easing curve (`cubic-bezier(.87,0,.13,1)`), moved clear of the WhatsApp FAB |
| 14 | **Wow.js reveals** | `data-wow-delay` on sections; `lib/animate/animate.css` (`fadeIn`, `slideInDown`, `pulse` 1.5s) | `Reveal.tsx` — IntersectionObserver adds `wow`/`animated` classes, so the archive's animate.css is what animates; respects `prefers-reduced-motion` |
| 15 | **404 page** | `404.html`: spinner → top bar → navbar → page-header breadcrumb → centred message → footer | `src/app/not-found.tsx` with the brief's copy (§17) |

### `js/main.js` behaviour inventory (verbatim, 6 behaviours)

1. `spinner()` — `setTimeout(..., 1)` then `$('#spinner').removeClass('show')`.
2. `new WOW().init()` — scroll reveals.
3. Sticky navbar — `scrollTop() > 300` toggles `shadow-sm` and `top` `0px` / `-100px`.
4. Back to top — fade in/out at 300px, animated scroll 1500ms `easeInOutExpo`.
5. Facts counter — `$('[data-toggle="counter-up"]').counterUp({delay:10, time:2000})`.
6. Testimonial carousel — Owl Carousel, `autoplay:true, smartSpeed:1000, items:1, dots:false, loop:true, nav:true`.

All six are reimplemented in React/TypeScript with matching timings and class output
(`src/components/*`), because jQuery, Bootstrap's JS bundle and Owl Carousel are not part of the
locked stack. `public/js/main.js` is retained untouched as the reference implementation.

---

## 6. Assets in the archive

* Photos (demo stock, licence note in `LICENSE.txt`: *"premium stock photos … only for demo purposes"*):
  `about.jpg` 37.8 KB, `carousel-1.jpg` 129.6 KB, `carousel-2.jpg` 95.5 KB, `feature.jpg` 29.5 KB,
  `profile.jpg` 2.0 KB, `team-1..4.jpg`, `testimonial-1..3.jpg`.
* Icons: `img/icon/icon-01..10-{light,primary}.png` — white and brand-blue variants, used as
  `.service-icon` content and as the navbar/footer brand mark (`icon-02`). **These are reused for the
  six product cards' iconography**, keeping the archive's visual language; photographs for the cards
  come from Pexels per the brief (§12 below).
* `insurance-html-template.jpg` — the template's own preview screenshot, kept in `_source/`.
* `img/favicon.ico` is referenced by all 9 HTML pages but **is missing from the archive** (dead link).

---

## 7. What the archive does **not** contain (searched exhaustively)

| searched for | result |
| --- | --- |
| `cookie` / `consent` / `gdpr` / `banner` | **none** — no cookie banner exists |
| `captcha` / `recaptcha` | **none** — no CAPTCHA integration exists |
| `process.env` / `import.meta.env` / `NEXT_PUBLIC_*` | **none** — no environment variables exist |
| `/api/` / `fetch(` / `XMLHttpRequest` / `axios` | **none** — no API routes, no network calls |
| `"dependencies":` (package.json) | **none** — no package manifest; dependencies are vendored files + CDN links |
| private/admin route | **none** |
| `privacy` / `terms` / legal pages | **none** — the footer links `Terms & Condition` and `Support` point at `href=""` |
| 500 / server error page | **none** — only `404.html` exists |
| blog / guides / MDX | **none** — no content system |
| client portal / auth | **none** |
| form submission handler | **none** — `contact.html` and `appointment.html` forms have no `action` and no JS handler; they post nowhere |

Every one of these is therefore **new work specified by the brief**, listed in §8–§9.

---

## 8. New build inventory (what this project adds, on top of the above)

### 8.1 Routes

| route | rendering | purpose |
| --- | --- | --- |
| `/` | static + client islands | regulatory bar, sticky navbar, split hero, 6 products, comparison teaser, claims, testimonials, newsletter, contact, footer |
| `/products/[slug]` | ISR `revalidate = 3600` | 6 product detail pages: what is covered / excluded / how claims work / why you need it / insurer comparison table / CTA |
| `/quote` | SSR (freshness) | 4-step quotation form + reCAPTCHA v3 |
| `/compare` | ISR `3600` | side-by-side comparison of up to 3 insurers |
| `/business` | static + client form | corporate & group schemes, enquiry form |
| `/claims` | static + client form | step-by-step claiming, emergency contacts, claim notification form + Blob upload |
| `/portal` | SSR, `no-store`, auth required | active policies, renewal dates, premiums, schedule PDF, claim notification, message broker |
| `/portal/login` | SSR | email + policy reference → email OTP |
| `/guides`, `/guides/[slug]` | ISR `3600`, MDX | articles, per brief §11 |
| `/legal/privacy-policy`, `/legal/terms`, `/legal/cookie-policy` | static | §16 of the brief |
| `/about`, `/careers`, `/contact` | static + client form | remaining nav items |
| `/styleguide` | static | visual QA of the extracted tokens and every source component, side by side |
| `not-found` / `error` | static / client | 404 and 500 copy exactly as specified |

### 8.2 API routes

| route | method | responsibility |
| --- | --- | --- |
| `/api/quote` | POST | validate, persist quotation (KV), WhatsApp to broker **and** WhatsApp confirmation + reference to client |
| `/api/group` | POST | group scheme enquiry → KV + WhatsApp + email to broker |
| `/api/claim` | POST | claim notification → Blob uploads + KV + broker alert |
| `/api/contact` | POST | general enquiry → Nodemailer (with KV record) |
| `/api/newsletter` | POST | subscriber → KV, reCAPTCHA v3 |
| `/api/captcha` | POST | server-side reCAPTCHA verification (v3 score, v2 fallback) |
| `/api/comparison` | GET, PUT | insurer comparison dataset; static JSON + broker-team admin updates |
| `/api/guides` | GET | MDX guide index/metadata |
| `/api/portal/policies` | GET | client's active policies (session required, `no-store`) |
| `/api/portal/documents` | GET | policy schedule PDF (session required) |
| `/api/portal/messages` | POST | message the broker from the portal |
| `/api/auth/[...nextauth]` | — | NextAuth email-OTP sign-in for `/portal` |

### 8.3 Data

As built (paths differ slightly from this plan, deliberately, so nothing is loaded twice):

* `src/data/products.ts` — 6 products with coverage, exclusions, claims steps, FAQs and SEO strings
  (TypeScript rather than JSON so the product slugs are a union type the pages can check).
* `src/data/insurers.json` — the comparison dataset, with a broker override merged in from KV.
* `src/lib/site.ts` — NAP details, licence number, WhatsApp link builder, navigation, footer groups,
  and `COUNTIES` with all 47 Kenyan counties (no `src/data/counties.json`, no `src/data/site.ts`).
* `src/content/guides/*.mdx` — 4 articles.
* `src/data/images.ts` + `src/data/images.generated.json` — the ten Pexels image slots (section 12).

---

## 9. Environment variables (names only; values never in the repo)

```
# public
NEXT_PUBLIC_SITE_URL              NEXT_PUBLIC_IRA_LICENSE_NUMBER    NEXT_PUBLIC_AKI_MEMBER_NUMBER
NEXT_PUBLIC_BROKER_PHONE          NEXT_PUBLIC_BROKER_EMAIL          NEXT_PUBLIC_WHATSAPP_NUMBER
NEXT_PUBLIC_OFFICE_ADDRESS        NEXT_PUBLIC_GOOGLE_MAPS_EMBED     NEXT_PUBLIC_RECAPTCHA_SITE_KEY
NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY NEXT_PUBLIC_PEXELS_ATTRIBUTION
# server
RECAPTCHA_SECRET_KEY              RECAPTCHA_V2_SECRET_KEY           RECAPTCHA_MIN_SCORE
RECAPTCHA_FAIL_OPEN               KV_REST_API_URL                   KV_REST_API_TOKEN
BLOB_READ_WRITE_TOKEN             SMTP_HOST                         SMTP_PORT
SMTP_SECURE                       SMTP_USER                         SMTP_PASSWORD
MAIL_FROM                         MAIL_TO_BROKER                    WHATSAPP_API_URL
WHATSAPP_API_TOKEN                WHATSAPP_PHONE_NUMBER_ID          WHATSAPP_BROKER_NUMBER
AUTH_SECRET                       NEXTAUTH_URL                      AUTH_EMAIL_FROM
ADMIN_TOKEN                       PORTAL_DEMO_MODE                  PEXELS_API_KEY
```

None of these exist in the archive — all are introduced by this build, documented in `.env.example`,
read only through `src/lib/env.ts`, and never exposed to the browser unless prefixed `NEXT_PUBLIC_`.

---

## 10. Decision log (conflicts between the archive and the brief, and how each is resolved)

1. **The archive's `#spinner` already exists** → copied and extended, not replaced. The archive's
   white full-viewport overlay, `.show` class contract and `role="status"` are kept; the brief's
   shield-SVG build-on, wordmark, progress bar, 3s skip, sub-2s completion and
   `prefers-reduced-motion` plain-text percentage are added around it.
2. **The brief specifies a split hero; the archive's hero is a 2-slide demo carousel.** The brief's
   page structure governs the new home page, so the hero is the specified split layout. The carousel
   CSS is left untouched in `style.css` and the original markup is preserved verbatim at
   `/design-reference/index.html` so nothing is destroyed. No other source element was replaced.
3. **jQuery / Bootstrap-JS / Owl Carousel are not in the locked stack** → their six behaviours are
   reimplemented in React with identical thresholds, durations and emitted classes (§5). Both
   frameworks' stylesheets still ship and still do the styling.
4. **No cookie banner, CAPTCHA, legal pages, API routes, env vars or package manifest exist** → all
   are built to the brief's specification and styled exclusively with the four source tokens (§2.1).
5. **`img/favicon.ico` is a dead link in the archive** → a shield favicon is generated in the same
   brand colours (`src/app/icon.svg`); the missing file is recorded rather than silently ignored.
6. **Pexels is unreachable from this build sandbox** → see §12.
7. **Licence condition:** the archive's licence forbids removing the HTML Codex credit. The footer
   keeps `Designed By HTML Codex / Distributed By ThemeWagon` verbatim, in addition to the Barnabas
   copyright line.
8. **`@vercel/kv` is deprecated upstream** in favour of Upstash Redis, but the brief names Vercel KV,
   so `@vercel/kv` is used and wrapped in `src/lib/store.ts`, which falls back to a local JSON store
   when `KV_REST_API_URL` is absent so the site works in development and preview. Same pattern for
   Vercel Blob in `/api/claim`.

---

## 11. Stack, verbatim from the brief, as installed

`next 15.3.3`, `react 19.1.0`, `react-dom 19.1.0`, `next-auth 5.0.0-beta.29`, `@vercel/kv 3.0.0`,
`@vercel/blob 2.8.1`, `nodemailer 6.10.1`, `zod 4.6.6`, `gray-matter 4.0.3`,
`next-mdx-remote 6.0.0`, `typescript 5.8.3`. `.nvmrc` → `24.3.0`; `engines.node` → `>=24.0.0`.
`nodemailer` is pinned to the 6.x line because `next-auth@5.0.0-beta.29` declares
`peerOptional nodemailer@^6.6.5`; 10.x cannot be installed alongside it without `--force`, which would
break the lockfile. Note for the record: npm flags `next@15.3.3` with advisory CVE-2025-66478 — the
brief locks this version, so it is kept, and the upgrade is recorded in `README.md` as follow-up work.

---

## 12. Images (Pexels)

The build sandbox can reach `registry.npmjs.org`, `github.com`, `pypi.org` and `files.pythonhosted.org`
only; `api.pexels.com` and `images.pexels.com` are blocked, so the fetch cannot be executed here.
Therefore:

* `scripts/fetch-pexels.mjs` — the build-time fetcher the brief asks for. It takes the 10 specified
  East African search queries, calls the Pexels API with `PEXELS_API_KEY`, chooses the best
  East-African-matching portrait/landscape crop, downloads into `public/images/`, and **writes
  `image-credits.md` automatically** (photographer, Pexels URL, licence note) with a stable filename
  manifest so reruns are idempotent. Run `npm run fetch-pexels`.
* The exact folder, filenames and query list are already in place (`public/images/`), and every image
  slot in the code reads from the manifest in `src/data/images.ts`, so running the script replaces the
  placeholder bitmaps with zero code changes.
* Until then, the site renders the archive's own demo photographs in those slots, with `image-credits.md`
  marking each one as a placeholder that must be replaced by a Pexels photo before launch. No AI
  imagery, no watermarks, nothing hotlinked from an unreachable host at runtime.

---

## 13. Accessibility, responsive and compliance commitments

* **Type floors** enforced in `globals.css` (§4). Natural wrap everywhere; no `white-space: nowrap` on
  copy; `text-wrap: pretty` on headings.
* **Touch targets ≥48×48** for every interactive element added (the archive's own `.btn-square`
  38px/32px squares are *inside* the footer's icon row and are padded to 48px hit area by the new
  `--b-touch` guard without altering their painted size — the one place a source value is padded
  rather than left, and it is recorded here).
* Breakpoints covered: 1440 / 1024 / 768 / 390 / 320 px. Product grid 3→2→1; comparison table
  horizontal scroll; quotation form single column on mobile; portal tabs scroll horizontally;
  regulatory bar abbreviated on mobile; footer single column.
* Voice button bottom-left and WhatsApp button bottom-right, always visible, never overlapping the
  back-to-top control.
* `prefers-reduced-motion` respected in the loading screen, reveals, headline build and voice tour.
* **Kenya Data Protection Act 2019** language in the cookie banner, banner footer note and privacy
  policy; ODPC reference; health data given an explicit higher-protection clause; IRA Kenya compliance
  and the licence number surfaced in the regulatory bar, about page, footer, 500 page and JSON-LD.
* Financial and health data never appear on a public route: quotation payloads are written to KV and
  returned only as a reference number; policy data is served only through session-guarded routes with
  `Cache-Control: no-store`.

---

## 14. Placeholders that must be confirmed before launch

These are the only values in the whole build that are not real, and each is env-driven so it can be
fixed without touching code:

| value | default used | set with |
| --- | --- | --- |
| IRA Kenya broker licence number | `IRA/BRK/0000/2025` | `NEXT_PUBLIC_IRA_LICENSE_NUMBER` |
| AKI membership number | `AKI/MEM/0000` | `NEXT_PUBLIC_AKI_MEMBER_NUMBER` |
| Office street address | `Kimathi Street, Nairobi CBD, Nairobi, Kenya` | `NEXT_PUBLIC_OFFICE_ADDRESS` |
| Public site URL | `https://barnabasinsurancebrokers.co.ke` | `NEXT_PUBLIC_SITE_URL` |
| Google Maps embed | maps plain embed for Nairobi CBD | `NEXT_PUBLIC_GOOGLE_MAPS_EMBED` |
| Indicative premiums in the comparison dataset | ranges marked "indicative" in the UI | `src/data/insurers.json` |

---

## 15. Build verification

See `README.md` → *Verification log* for the type-check, production build, route table and the
end-to-end API checks run against this build.
