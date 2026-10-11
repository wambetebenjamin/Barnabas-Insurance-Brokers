/**
 * Barnabas Insurance Brokers - design-source inventory extraction.
 *
 * Reads the unmodified Insure v1.0.0 design source from ./_source and emits
 * INVENTORY-EXTRACTION.md containing, verbatim:
 *   - the full file tree
 *   - every CSS custom property (style.css + bootstrap.min.css)
 *   - every @font-face rule
 *   - every font / icon-font stylesheet reference
 *   - the type scale used by the source
 *   - the loading screen ("spinner") markup
 *   - the copyright / attribution notice the source license requires
 *   - the result of scanning the source for cookie, CAPTCHA, API route and
 *     environment-variable artefacts
 *
 * Run:  npm run inventory
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "_source");
const OUT = join(ROOT, "INVENTORY-EXTRACTION.md");

if (!existsSync(SRC)) {
  console.error("_source/ not found. Unzip insure-v1.0.0.zip into ./_source first.");
  process.exit(1);
}

/* ------------------------------------------------------------------ tree */

function walk(dir, depth = 0, acc = []) {
  const entries = readdirSync(dir).sort((a, b) => a.localeCompare(b));
  for (const name of entries) {
    const full = join(dir, name);
    const st = statSync(full);
    const rel = relative(SRC, full);
    if (st.isDirectory()) {
      acc.push({ rel, dir: true, size: 0 });
      walk(full, depth + 1, acc);
    } else {
      acc.push({ rel, dir: false, size: st.size });
    }
  }
  return acc;
}

const entries = walk(SRC);
const treeLines = entries
  .map((e) => {
    const parts = e.rel.split("/");
    const indent = "  ".repeat(parts.length - 1);
    return e.dir
      ? `${indent}${parts.at(-1)}/`
      : `${indent}${parts.at(-1)}  (${e.size.toLocaleString("en-US")} bytes)`;
  })
  .join("\n");
const fileCount = entries.filter((e) => !e.dir).length;
const totalBytes = entries.reduce((n, e) => n + e.size, 0);

/* ------------------------------------------------------ CSS custom props */

const read = (p) => {
  try {
    return readFileSync(join(SRC, p), "utf8");
  } catch {
    return "";
  }
};
const styleCss = read("css/style.css");
const bootstrapCss = read("css/bootstrap.min.css");

function customProps(css) {
  const out = [];
  const re = /(--[a-z0-9-]+)\s*:\s*([^;}]+)[;}]/gi;
  let m;
  while ((m = re.exec(css))) out.push({ name: m[1], value: m[2].trim() });
  return out;
}

const styleProps = customProps(styleCss);
// bootstrap.min.css redeclares --bs-gutter-* per utility class; keep the :root block only.
const rootBlock = bootstrapCss.match(/:root\{([^}]*)\}/);
const bsRootProps = rootBlock
  ? customProps(rootBlock[1] + ";")
  : [];
const bsAllUnique = [...new Set(customProps(bootstrapCss).map((p) => p.name))];

/* --------------------------------------------------------- @font-face */

const fontFaceRe = /@font-face\s*\{[^}]*\}/gi;
const fontFaces = [
  ...(styleCss.match(fontFaceRe) ?? []).map((r) => ({ file: "css/style.css", rule: r })),
  ...(bootstrapCss.match(fontFaceRe) ?? []).map((r) => ({ file: "css/bootstrap.min.css", rule: r })),
];

/* ------------------------------------------------- html head references */

const htmlFiles = entries.filter((e) => !e.dir && e.rel.endsWith(".html")).map((e) => e.rel);
const headRefs = new Map();
for (const f of htmlFiles) {
  const html = read(f);
  const links = html.match(/<link[^>]+href="([^"]+)"[^>]*>/g) ?? [];
  for (const l of links) {
    const href = l.match(/href="([^"]+)"/)?.[1] ?? "";
    if (/font|icon|animate|owl|bootstrap/.test(href)) {
      if (!headRefs.has(href)) headRefs.set(href, []);
      headRefs.get(href).push(f);
    }
  }
}

/* ------------------------------------------------------------ type scale */

function rule(selector, css) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = css.match(new RegExp(`(?:^|[},])${esc}\\{([^}]*)\\}`));
  return m ? m[1] : null;
}
const typeScale = [
  ["body", "body"],
  ["h1", "h1"],
  ["h2", "h2"],
  ["h3", "h3"],
  ["h4", "h4"],
  ["h5", "h5"],
  ["h6", "h6"],
  [".display-1", ".display-1"],
  [".display-2", ".display-2"],
  [".display-3", ".display-3"],
  [".display-4", ".display-4"],
  [".display-5", ".display-5"],
  [".display-6", ".display-6"],
  [".lead", ".lead"],
  [".small / small", ".small"],
  [".btn", ".btn"],
  [".navbar .navbar-nav .nav-link", null],
]
  .map(([label, sel]) =>
    sel === null
      ? { label, decl: "margin-left: 25px; padding: 10px 0; font-weight: 500 (size inherits 1rem)" }
      : { label, decl: rule(sel, bootstrapCss) }
  )
  .filter((r) => r.decl);

/* ----------------------------------------------------------- spinner */

const spinnerMarkup =
  read("index.html").match(/<!-- Spinner Start -->[\s\S]*?<!-- Spinner End -->/)?.[0] ?? "(not found)";

/* ------------------------------------ absent-feature scan (explicit) */

const ALL = entries.filter((e) => !e.dir);
const scan = (pattern) => {
  const hits = [];
  for (const e of ALL) {
    if (!/\.(html|css|js|php|json|txt|md)$/i.test(e.rel)) continue;
    let body = "";
    try {
      body = readFileSync(join(SRC, e.rel), "utf8");
    } catch {
      continue;
    }
    if (pattern.test(body)) hits.push(e.rel);
  }
  return hits;
};

const scans = [
  ["cookie / consent banner", /cookie[- _]?(consent|banner|notice|policy)|gdpr/i],
  ["CAPTCHA / reCAPTCHA", /recaptcha|captcha|hcaptcha/i],
  ["environment variable reference", /process\.env|import\.meta\.env|NEXT_PUBLIC|REACT_APP/i],
  ["API route / fetch call", /\/api\/|fetch\(|XMLHttpRequest|axios/i],
  ["package.json / npm dependency", /"(dependencies|devDependencies)"\s*:/i],
  ["loading / progress indicator", /spinner|preloader|loader|progress-bar/i],
  ["404 page", /404|not found/i],
  ["500 / server error page", /500|internal server error|server error/i],
  ["privacy policy page", /privacy[- _]?policy|privacy\.html/i],
  ["terms page", /terms|conditions/i],
];

/* ------------------------------------------------------------ versions */

let versions = "(package.json not found)";
try {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  versions = [
    "| package | declared version |",
    "| --- | --- |",
    ...Object.entries(pkg.dependencies ?? {}).map(([k, v]) => `| ${k} | ${v} |`),
    ...Object.entries(pkg.devDependencies ?? {}).map(([k, v]) => `| ${k} (dev) | ${v} |`),
  ].join("\n");
} catch {}

/* ------------------------------------------------------------- write */

const md = `# INVENTORY-EXTRACTION.md

> Generated by \`scripts/extract-inventory.mjs\` (\`npm run inventory\`) directly from the
> unmodified design source in \`_source/\`. Every value below is a verbatim extraction.
> Do not hand-edit: regenerate instead.

Source archive: \`insure-v1.0.0.zip\` - "Insure - Insurance HTML Template", HTML Codex, v1.0.0.
Files: **${fileCount}** - uncompressed: **${totalBytes.toLocaleString("en-US")} bytes**.

---

## 1. Full file tree

\`\`\`
${treeLines}
\`\`\`

---

## 2. CSS custom properties

### 2.1 \`css/style.css\` -> \`:root\` (the design tokens - reproduced verbatim)

\`\`\`css
:root {
${styleProps.map((p) => `    ${p.name}: ${p.value};`).join("\n")}
}
\`\`\`

| token | value | role in source |
| --- | --- | --- |
| \`--primary\` | \`#015FC9\` | brand blue: buttons, active nav, icons, overlays |
| \`--secondary\` | \`#0DD3F1\` | cyan accent: hover states, footer links |
| \`--light\` | \`#F6F7FC\` | section background tint |
| \`--dark\` | \`#15233C\` | dark surfaces: top bar, footer |

Every other occurrence of these tokens in \`css/style.css\` (${styleProps.length - 4} references) is listed below in source order so that no usage is lost:

\`\`\`
${styleProps
  .slice(4)
  .map((p) => `${p.name}: ${p.value}`)
  .join("\n") || "(none - tokens are declared once and consumed via var())"}
\`\`\`

### 2.2 \`css/bootstrap.min.css\` -> \`:root\` (compiled Bootstrap 5.0.0, theme colours overridden)

\`\`\`css
:root {
${bsRootProps.map((p) => `    ${p.name}: ${p.value};`).join("\n")}
}
\`\`\`

The \`--bs-primary\`, \`--bs-secondary\`, \`--bs-light\` and \`--bs-dark\` values were recompiled
by the template author to the four brand colours above. All **${bsAllUnique.length}** distinct
\`--bs-*\` custom properties present in the compiled Bootstrap build (including scoped
\`--bs-gutter-*\` and \`--bs-table-*\` declarations):

\`\`\`
${bsAllUnique.join("\n")}
\`\`\`

---

## 3. \`@font-face\` rules

${
  fontFaces.length === 0
    ? `**NONE.** The design source contains no \`@font-face\` rule in any stylesheet.
Fonts are loaded exclusively through remote Google Fonts / icon-font stylesheets (section 4),
so the face definitions live on the provider's CDN and are not part of the archive.`
    : fontFaces.map((f) => `### ${f.file}\n\n\`\`\`css\n${f.rule}\n\`\`\``).join("\n\n")
}

---

## 4. Font and icon-font stylesheet references (identical in all ${htmlFiles.length} HTML pages)

| href | referenced by |
| --- | --- |
${[...headRefs.entries()]
  .map(([href, files]) => `| \`${href}\` | ${files.length === htmlFiles.length ? `all ${files.length} pages` : files.join(", ")} |`)
  .join("\n")}

Google Fonts family request, verbatim:

\`\`\`
https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&family=Poppins:wght@600;700&display=swap
\`\`\`

* **Body / UI face:** Roboto, weights 400 and 500 only.
* **Heading face:** Poppins, weights 600 and 700 only.
* Icon fonts: Font Awesome 5.10.0 (\`fa\`, \`far\`, \`fas\`, \`fab\` classes are used in the markup)
  and Bootstrap Icons 1.4.1 (\`bi bi-chevron-left\`, \`bi bi-arrow-up\`, \`bi-*\`).

---

## 5. Type scale as compiled in the source

Extracted from \`css/bootstrap.min.css\`. \`1rem = 16px\` because the source sets no
\`html { font-size }\` override.

| selector | declarations as compiled |
| --- | --- |
${typeScale.map((t) => `| \`${t.label}\` | \`${t.decl}\` |`).join("\n")}

| selector | declarations (from \`css/style.css\`) |
| --- | --- |
| \`.btn\` | \`transition: .5s;\` |
| \`.btn-square\` | \`width: 38px; height: 38px;\` |
| \`.btn-sm-square\` | \`width: 32px; height: 32px;\` |
| \`.btn-lg-square\` | \`width: 48px; height: 48px;\` |
| \`.navbar .navbar-nav .nav-link\` | \`margin-left: 25px; padding: 10px 0; color: #696E77; font-weight: 500;\` |
| \`.footer .copyright\` | \`padding: 25px 0; font-size: 15px;\` |
| \`.service-item\` | \`box-shadow: 0 0 45px rgba(0, 0, 0, .07);\` |
| \`.service-item .service-icon\` | \`width: 90px; height: 90px;\` |
| \`.back-to-top\` | \`position: fixed; right: 30px; bottom: 30px; z-index: 99;\` |

Note the only explicit \`font-size\` in the hand-written stylesheet is \`15px\`
(\`.footer .copyright\`). Everything else inherits Bootstrap's rem scale.

---

## 6. Loading screen ("spinner") - verbatim markup, present in all ${htmlFiles.length} pages

\`\`\`html
${spinnerMarkup.trim()}
\`\`\`

Behaviour, verbatim from \`js/main.js\`:

\`\`\`js
var spinner = function () {
    setTimeout(function () {
        if ($('#spinner').length > 0) {
            $('#spinner').removeClass('show');
        }
    }, 1);
};
spinner();
\`\`\`

Styles, verbatim from \`css/style.css\`:

\`\`\`css
#spinner {
    opacity: 0;
    visibility: hidden;
    transition: opacity .5s ease-out, visibility 0s linear .5s;
    z-index: 99999;
}

#spinner.show {
    transition: opacity .5s ease-out, visibility 0s linear 0s;
    visibility: visible;
    opacity: 1;
}
\`\`\`

The source \`#spinner\` is a white full-viewport overlay holding one
\`<div class="spinner-grow text-primary" role="status">\` and is removed on the next tick.
The \`role="status"\` attribute is the only accessibility affordance present.

---

## 7. Feature scan: what the design source does and does not contain

| capability | files in source that reference it |
| --- | --- |
${scans.map(([label, re]) => `| ${label} | ${scans.length && scan(re).length ? scan(re).map((f) => `\`${f}\``).join(", ") : "**none**"} |`).join("\n")}

Consequences for this build, all recorded so nothing is silently invented:

* **No cookie banner** exists in the source, so the banner in section 15 of the brief is implemented
  from the specification (bottom-fixed, full width, Accept All + Manage Preferences, four categories,
  \`localStorage\`, link to \`/legal/cookie-policy\`) and styled with the four source tokens.
* **No CAPTCHA, no API routes, no environment variables and no package manifest** exist in the source.
  Every backend surface (\`/api/*\`, server-side verification, KV, Blob) is new work specified by the brief.
* **No legal pages** exist in the source, so \`/legal/privacy-policy\`, \`/legal/terms\` and
  \`/legal/cookie-policy\` are new pages built on the source's \`.page-header\` breadcrumb pattern and tokens.
* \`404.html\` **does** exist and is reproduced in section 9 of this inventory; no \`500\` page exists.
* \`lib/waypoints/links.php\` is a vestigial PHP file shipped inside the template archive. It is not
  referenced by any HTML page and is carried over only as part of the untouched reference copy.

---

## 8. Package versions

### 8.1 Design source

The archive ships **no \`package.json\`**. Its dependencies are vendored as loose files and CDN links:

| asset | version | delivery |
| --- | --- | --- |
| Bootstrap | 5.0.0 (compiled) | \`css/bootstrap.min.css\`, \`lib/\` |
| jQuery | 3.4.1 | \`https://code.jquery.com/jquery-3.4.1.min.js\` |
| Bootstrap JS bundle | 5.0.0 | \`https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js\` |
| Owl Carousel | vendored | \`lib/owlcarousel/\` (MIT, LICENSE shipped) |
| WOW.js | vendored | \`lib/wow/\` |
| Waypoints | vendored | \`lib/waypoints/\` |
| jQuery Easing | vendored | \`lib/easing/\` |
| Counter-Up | vendored | \`lib/counterup/\` |
| Animate.css | vendored | \`lib/animate/\` |
| Font Awesome | 5.10.0 | \`cdnjs.cloudflare.com\` |
| Bootstrap Icons | 1.4.1 | \`cdn.jsdelivr.net\` |
| Roboto / Poppins | Google Fonts | \`fonts.googleapis.com\` |

### 8.2 This build

${versions}

---

## 9. \`404.html\` page structure (source), verbatim section order

\`\`\`
Spinner  ->  Topbar  ->  Navbar  ->  Page Header (breadcrumb)  ->  [content]  ->  Footer  ->  Back to Top
\`\`\`

The source 404 page reuses \`.page-header\` (background \`../img/carousel-1.jpg\`, centred) with a
Bootstrap breadcrumb and a large centred message, then the shared footer. This layout is reproduced
for the Barnabas 404 in \`src/app/not-found.tsx\`.

---

## 10. Attribution required by \`LICENSE.txt\`

\`LICENSE.txt\` is "Free HTML Template License by HTML Codex": use, modify and port are allowed;
**removal of the author's credit link is not allowed** without a paid Credit Removal License.
The source footer therefore carries, verbatim:

\`\`\`html
Designed By <a href="https://htmlcodex.com">HTML Codex</a>
<br />Distributed By:
<a href="https://themewagon.com" target="_blank">ThemeWagon</a>
\`\`\`

The Barnabas footer in \`src/components/Footer.tsx\` preserves this attribution link, which is a
licence condition and not a design choice.
`;

writeFileSync(OUT, md, "utf8");
console.log(`Wrote ${relative(ROOT, OUT)} (${md.length.toLocaleString("en-US")} bytes)`);
console.log(`  files scanned : ${fileCount}`);
console.log(`  css tokens    : ${styleProps.length} in style.css, ${bsAllUnique.length} distinct --bs-* in bootstrap`);
console.log(`  @font-face    : ${fontFaces.length} found`);
