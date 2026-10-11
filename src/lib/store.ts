/**
 * Storage: Vercel KV, with a local file fallback.
 *
 * The brief specifies Vercel KV for quotations, group enquiries and subscribers.
 * KV is used whenever KV_REST_API_URL and KV_REST_API_TOKEN are present. When
 * they are not (a fresh clone, a preview deploy without storage attached, the
 * build sandbox) records are written to ./.data/*.json so the site keeps working
 * and the broker team can still read a lead. Every write reports which backend
 * served it, and that value is returned to the caller and logged.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { capabilities, serverEnv } from "@/lib/env";

export type Backend = "kv" | "file";

export interface Record {
  id: string;
  createdAt: string;
  [key: string]: unknown;
}

const DATA_DIR = path.join(process.cwd(), ".data");

const filePath = (key: string): string =>
  path.join(DATA_DIR, `${key.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`);

async function readList(key: string): Promise<Record[]> {
  try {
    const raw = await fs.readFile(filePath(key), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Record[]) : [];
  } catch {
    return [];
  }
}

async function writeList(key: string, records: Record[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath(key), JSON.stringify(records, null, 2), "utf8");
}

/** Loads the KV client only when it is configured, so the module is import-safe. */
async function kvClient() {
  if (!capabilities.kv) return null;
  try {
    const { kv } = await import("@vercel/kv");
    return kv;
  } catch {
    return null;
  }
}

/**
 * Appends a record to a list, newest first.
 * Returns the backend that stored it so the API response can be honest about
 * where the data went.
 */
export async function append(
  listKey: string,
  record: Record,
): Promise<{ backend: Backend; stored: boolean }> {
  const client = await kvClient();
  if (client) {
    try {
      await client.lpush(listKey, record);
      await client.ltrim(listKey, 0, 4999);
      return { backend: "kv", stored: true };
    } catch (error) {
      console.error(`[store] KV write failed for ${listKey}, falling back to file`, error);
    }
  }
  try {
    const records = await readList(listKey);
    records.unshift(record);
    await writeList(listKey, records.slice(0, 5000));
    return { backend: "file", stored: true };
  } catch (error) {
    console.error(`[store] file write failed for ${listKey}`, error);
    return { backend: "file", stored: false };
  }
}

export async function list(listKey: string, limit = 50): Promise<Record[]> {
  const client = await kvClient();
  if (client) {
    try {
      const records = await client.lrange<Record>(listKey, 0, limit - 1);
      return records ?? [];
    } catch (error) {
      console.error(`[store] KV read failed for ${listKey}`, error);
    }
  }
  const records = await readList(listKey);
  return records.slice(0, limit);
}

export async function setJson(key: string, value: unknown): Promise<{ backend: Backend; stored: boolean }> {
  const client = await kvClient();
  if (client) {
    try {
      await client.set(key, value);
      return { backend: "kv", stored: true };
    } catch (error) {
      console.error(`[store] KV set failed for ${key}`, error);
    }
  }
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath(key), JSON.stringify(value, null, 2), "utf8");
    return { backend: "file", stored: true };
  } catch (error) {
    console.error(`[store] file set failed for ${key}`, error);
    return { backend: "file", stored: false };
  }
}

export async function getJson<T>(key: string): Promise<T | null> {
  const client = await kvClient();
  if (client) {
    try {
      const value = await client.get<T>(key);
      if (value) return value;
    } catch (error) {
      console.error(`[store] KV get failed for ${key}`, error);
    }
  }
  try {
    const raw = await fs.readFile(filePath(key), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** KV list keys used across the app. One place, so nothing is mistyped. */
export const KEYS = {
  quotations: "bib:quotations",
  groupEnquiries: "bib:group-enquiries",
  claims: "bib:claims",
  contacts: "bib:contacts",
  subscribers: "bib:newsletter-subscribers",
  comparisonOverrides: "bib:comparison-overrides",
  portalPolicies: (email: string) => `bib:portal:policies:${email.toLowerCase()}`,
  portalMessages: (email: string) => `bib:portal:messages:${email.toLowerCase()}`,
  portalOtp: (email: string) => `bib:portal:otp:${email.toLowerCase()}`,
  rateLimit: (bucket: string, ip: string) => `bib:rl:${bucket}:${ip}`,
} as const;

export const backendName = (): string => (capabilities.kv ? "Vercel KV" : "local file store (.data)");

export const storageWarning = (): string | null =>
  capabilities.kv
    ? null
    : `KV_REST_API_URL and KV_REST_API_TOKEN are not set, so this record was written to the local file store (.data) instead of Vercel KV. Set them in the Vercel project to enable durable storage.`;

export { serverEnv };
