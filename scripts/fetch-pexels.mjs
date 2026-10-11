#!/usr/bin/env node
/**
 * Pexels image fetcher for Barnabas Insurance Brokers.
 *
 *   PEXELS_API_KEY=xxxxxxxx npm run fetch-pexels
 *   PEXELS_API_KEY=xxxxxxxx npm run fetch-pexels -- --only heroFamily,motor
 *   npm run fetch-pexels -- --check          # report status, no network calls
 *
 * What it does
 *   1. Reads the ten slots and their exact search queries from src/data/images.ts.
 *   2. Calls the Pexels API (https://api.pexels.com/v1/search) once per slot.
 *   3. Picks the best candidate: landscape orientation, largest reasonable size,
 *      skipping anything already used by another slot so the site does not repeat
 *      the same photograph twice.
 *   4. Downloads the "large2x" file to /public/images/<slot>.jpg, then writes
 *      /public/images/<slot>.photo.json with the photographer credit.
 *   5. Rewrites src/data/images.generated.json so the app picks the local file up
 *      on the next build, and appends every credit to image-credits.md.
 *
 * Why an API key and not committed photos
 *   The Pexels licence (https://www.pexels.com/license/) allows free commercial
 *   use with attribution appreciated but not required, and forbids reselling the
 *   photos unaltered. Downloading at build time keeps the repository free of a
 *   binary image set and keeps the provenance recorded in image-credits.md.
 *
 * Notes
 *   - No AI generated images. No watermarked images. Subjects must be East African.
 *   - The script never overwrites an existing photo unless --force is passed.
 *   - If PEXELS_API_KEY is missing it exits 0 with a clear explanation, so it is
 *     safe to wire into a build pipeline before the key has been added.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE_DIR = join(ROOT, "public", "images");
const GENERATED = join(ROOT, "src", "data", "images.generated.json");
const CREDITS = join(ROOT, "image-credits.md");
const IMAGES_TS = join(ROOT, "src", "data", "images.ts");

const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const flagValue = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

const ONLY = flagValue("--only")?.split(",").map((value) => value.trim()).filter(Boolean);
const FORCE = hasFlag("--force");
const CHECK = hasFlag("--check");

const PEXELS_API = "https://api.pexels.com/v1/search";

/** Read the slot table out of src/data/images.ts so the two can never drift. */
async function readSlots() {
  const source = await readFile(IMAGES_TS, "utf8");
  const block = source.match(/export const IMAGE_SLOTS[\s\S]*?\n};/);
  if (!block) throw new Error("Could not find IMAGE_SLOTS in src/data/images.ts");

  const slots = {};
  const slotRe = /^ {2}(\w+): \{([\s\S]*?)^ {2}\},?$/gm;
  let match;
  while ((match = slotRe.exec(block[0])) !== null) {
    const [, key, body] = match;
    const query = body.match(/query:\s*"([^"]+)"/)?.[1];
    const orientation = body.match(/orientation:\s*"(\w+)"/)?.[1] ?? "landscape";
    const alt = body.match(/alt:\s*"([^"]+)"/)?.[1] ?? "";
    if (query) slots[key] = { key, query, orientation, alt };
  }

  if (Object.keys(slots).length !== 10) {
    throw new Error(`Expected 10 image slots, found ${Object.keys(slots).length}`);
  }
  return slots;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function loadGenerated() {
  try {
    const raw = JSON.parse(await readFile(GENERATED, "utf8"));
    delete raw._comment;
    return raw;
  } catch {
    return {};
  }
}

/** East African relevance guard. Kenyan and East African terms that must appear. */
const EAST_AFRICAN_TERMS = [
  "africa", "african", "kenya", "kenyan", "nairobi", "tanzania", "uganda", "rwanda",
  "mombasa", "kisumu", "nakuru", "east africa", "safari", "kitenge", "kanga",
];

function looksEastAfrican(photo) {
  const haystack = `${photo.alt ?? ""} ${photo.url ?? ""}`.toLowerCase();
  return EAST_AFRICAN_TERMS.some((term) => haystack.includes(term));
}

function pickPhoto(photos, used, orientation) {
  const scored = photos
    .map((photo, index) => {
      let score = 0;
      if (photo.orientation === orientation) score += 40;
      if (looksEastAfrican(photo)) score += 60;
      if (photo.width >= 1600) score += 25;
      else if (photo.width >= 1200) score += 15;
      if (used.has(photo.id)) score -= 500;
      // Slight preference for results Pexels ranks higher.
      score -= index;
      return { photo, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best) return null;
  // Reject a candidate that is neither East African looking nor landscape: better
  // to leave the slot on the design source photograph than to ship something wrong.
  const eastAfrican = looksEastAfrican(best.photo);
  if (!eastAfrican && best.photo.orientation !== orientation) return null;
  return best.photo;
}

async function searchPexels(query, apiKey, orientation) {
  const url = new URL(PEXELS_API);
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "24");
  url.searchParams.set("orientation", orientation);
  url.searchParams.set("size", "large");

  const response = await fetch(url, {
    headers: { Authorization: apiKey, "User-Agent": "Barnabas-Insurance-Brokers/1.0" },
  });

  if (response.status === 401) {
    throw new Error("Pexels rejected the API key. Check PEXELS_API_KEY.");
  }
  if (response.status === 429) {
    throw new Error("Pexels rate limit reached. Wait an hour and run the script again.");
  }
  if (!response.ok) {
    throw new Error(`Pexels search failed (${response.status} ${response.statusText}) for "${query}"`);
  }

  const data = await response.json();
  return Array.isArray(data.photos) ? data.photos : [];
}

async function download(url, destination) {
  const response = await fetch(url, { headers: { "User-Agent": "Barnabas-Insurance-Brokers/1.0" } });
  if (!response.ok) throw new Error(`Download failed (${response.status}) for ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength < 20_000) {
    throw new Error(`Downloaded file for ${url} looks too small to be a photograph`);
  }
  await writeFile(destination, buffer);
  return createHash("sha256").update(buffer).digest("hex").slice(0, 16);
}

function creditLine(slot, photo, file, size, hash) {
  return [
    `### ${slot.key}`,
    "",
    `- **File:** \`${file}\` (${size})`,
    `- **Search query:** \`${slot.query}\``,
    `- **Pexels photo page:** ${photo.url}`,
    `- **Photographer:** ${photo.photographer} (${photo.photographer_url})`,
    `- **Description:** ${photo.alt || "No description supplied by Pexels"}`,
    `- **Original size:** ${photo.width}x${photo.height}, downloaded as \`large2x\``,
    `- **Licence:** Pexels licence, free for commercial use, no watermark, no attribution required (attribution given here anyway). Downloaded ${new Date().toISOString().slice(0, 10)}.`,
    `- **Alt text in the UI:** ${slot.alt}`,
    `- **Checksum (sha256, first 16):** \`${hash}\``,
    "",
  ].join("\n");
}

async function updateCredits(newEntries, slots) {
  const existing = (await exists(CREDITS)) ? await readFile(CREDITS, "utf8") : "";
  const header = existing.includes("# Image credits")
    ? existing.split("\n### ")[0]
    : `# Image credits

Photography on the Barnabas Insurance Brokers website comes from [Pexels](https://www.pexels.com/),
which grants free commercial use with no watermark and no attribution requirement. Attribution is
recorded here anyway, because a broker should be able to show where every picture came from.

Every subject is East African, matching the clients we serve. No AI generated imagery is used
anywhere on this site, in line with the brief.

Regenerate or update with \`PEXELS_API_KEY=... npm run fetch-pexels\`. Slots that still show a
photograph from the design source template are listed at the end as outstanding work.

`;

  const outstanding = Object.keys(slots).filter((key) => !newEntries.has(key));
  const footer =
    outstanding.length > 0
      ? `\n## Outstanding: still on the design source photograph\n\n` +
        outstanding.map((key) => `- \`${key}\`: ${slots[key].query}`).join("\n") +
        `\n\nThese slots fall back to photographs that shipped inside the Insure v1.0.0 design source\nuntil \`npm run fetch-pexels\` has been run with a valid Pexels API key.\n`
      : `\nAll image slots are supplied by Pexels photographs downloaded into \`public/images/\`.\n`;

  const body = existing.includes("\n### ")
    ? existing.slice(existing.indexOf("\n### ") + 1)
    : "";

  await writeFile(CREDITS, header + body + footer, "utf8");
}

async function main() {
  const slots = await readSlots();
  const generated = await loadGenerated();
  const targets = ONLY ? Object.keys(slots).filter((key) => ONLY.includes(key)) : Object.keys(slots);

  const status = targets.map((key) => {
    const value = generated[key];
    return `${generated[key] ? "ok  " : "MISS"} ${key.padEnd(26)} ${
      value ?? slots[key].query
    }`;
  });

  if (CHECK || !process.env.PEXELS_API_KEY) {
    console.log("Pexels image slots:\n");
    console.log(status.join("\n"));
    console.log(
      CHECK
        ? "\n--check passed: no network calls were made."
        : "\nPEXELS_API_KEY is not set, so nothing was downloaded. " +
            "Get a free key at https://www.pexels.com/api/ and run: " +
            "PEXELS_API_KEY=xxxx npm run fetch-pexels",
    );
    console.log(
      "\nUntil then, each slot falls back to a photograph from the design source and " +
        "src/data/images.generated.json stays null. See image-credits.md.",
    );
    process.exit(0);
  }

  await mkdir(IMAGE_DIR, { recursive: true });

  const existingFiles = await readdir(IMAGE_DIR).catch(() => []);
  const used = new Set();
  const written = new Set();
  const failures = [];

  for (const key of targets) {
    const slot = slots[key];
    const destination = join(IMAGE_DIR, `${key}.jpg`);
    const relative = `/images/${key}.jpg`;

    if (existingFiles.includes(`${key}.jpg`) && !FORCE) {
      console.log(`skip  ${key}: ${relative} already exists (use --force to replace)`);
      generated[key] = relative;
      written.add(key);
      continue;
    }

    try {
      process.stdout.write(`search ${key} ... `);
      const photos = await searchPexels(slot.query, process.env.PEXELS_API_KEY, slot.orientation);
      const photo = pickPhoto(photos, used, slot.orientation);

      if (!photo) {
        throw new Error(
          `no suitable East African ${slot.orientation} result for "${slot.query}". ` +
            `Loosen the query in src/data/images.ts or pick the photo manually from Pexels.`,
        );
      }

      used.add(photo.id);
      const source = photo.src?.large2x ?? photo.src?.large ?? photo.src?.original;
      if (!source) throw new Error("Pexels returned no downloadable size for this photo");

      const hash = await download(source, destination);
      const size = `${photo.width}x${photo.height}`;

      await writeFile(
        join(IMAGE_DIR, `${key}.photo.json`),
        JSON.stringify(
          {
            slot: key,
            query: slot.query,
            alt: slot.alt,
            pexelsId: photo.id,
            pexelsUrl: photo.url,
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
            licence: "https://www.pexels.com/license/",
            downloadedAt: new Date().toISOString(),
            sha256: hash,
          },
          null,
          2,
        ) + "\n",
        "utf8",
      );

      generated[key] = relative;
      written.add(key);
      console.log(`ok    ${relative} (${size}) by ${photo.photographer}`);
    } catch (error) {
      failures.push({ key, message: error.message });
      console.log(`fail  ${error.message}`);
    }
  }

  // Preserve the explanatory comment so a fresh clone still explains the nulls.
  const output = {
    _comment:
      "Written by scripts/fetch-pexels.mjs. A null value means the slot still falls back to the design source photograph and MUST be replaced with a Pexels photo before launch. See image-credits.md.",
    ...Object.fromEntries(Object.keys(slots).map((key) => [key, generated[key] ?? null])),
  };

  await writeFile(GENERATED, JSON.stringify(output, null, 2) + "\n", "utf8");
  await updateCredits(written, slots);

  console.log(`\nWrote ${GENERATED} and updated ${CREDITS}.`);
  if (failures.length > 0) {
    console.log(`\n${failures.length} slot(s) still need attention. Pick them manually from Pexels:`);
    for (const failure of failures) console.log(`  - ${failure.key}: ${failure.message}`);
  } else {
    console.log("\nEvery targeted slot now uses a local Pexels photograph. Run npm run build.");
  }
}

main().catch((error) => {
  console.error(`\nfetch-pexels failed: ${error.message}`);
  process.exit(1);
});
