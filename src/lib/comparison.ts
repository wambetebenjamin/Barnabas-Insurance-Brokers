/**
 * Insurance comparison dataset.
 *
 * Source of truth is src/data/insurers.json, committed and reviewed. The broker
 * team can override any product’s rows through PUT /api/comparison (ADMIN_TOKEN),
 * which writes to Vercel KV; the override is merged on read so a corrected rate
 * appears on the next request rather than waiting for a deploy.
 *
 * Nothing here is client specific: insurer names, indicative premiums, limits,
 * excesses and benefit wording. It is the only dataset on the site that is safe to
 * serve from a public route.
 */
import dataset from "@/data/insurers.json";
import { KEYS, getJson } from "@/lib/store";
import { BASE_PRODUCTS, type ComparisonProduct, type ComparisonRow } from "@/lib/comparison-shared";

// Re-exported so server components can keep importing everything from one module.
// Client components must import from "@/lib/comparison-shared" instead, because this
// module reaches node:fs through the storage layer.
export type { ComparisonProduct, ComparisonRow };
export { CYCLE_LABEL } from "@/lib/comparison-shared";

const base = BASE_PRODUCTS as Record<string, ComparisonRow[]>;

export interface ComparisonPayload {
  version: string;
  currency: string;
  updatedAt: string;
  disclaimer: string;
  maintainedBy: string;
  profiles: Record<string, string>;
  adjustedByBrokerTeam: string[];
  products: Record<string, ComparisonRow[]>;
}

export async function getComparison(product?: string): Promise<ComparisonPayload> {
  const overrides =
    (await getJson<Partial<Record<string, ComparisonRow[]>>>(KEYS.comparisonOverrides)) ?? {};

  const products: Record<string, ComparisonRow[]> = { ...base };
  const adjusted: string[] = [];

  for (const [key, rows] of Object.entries(overrides)) {
    if (key.startsWith("_")) continue;
    if (rows && rows.length > 0) {
      products[key] = rows;
      adjusted.push(key);
    }
  }

  return {
    version: dataset.version,
    currency: dataset.currency,
    updatedAt: dataset.updatedAt,
    disclaimer: dataset.disclaimer,
    maintainedBy: dataset.maintainedBy,
    profiles: dataset.profiles as Record<string, string>,
    adjustedByBrokerTeam: adjusted,
    products: product && products[product] ? { [product]: products[product] } : products,
  };
}

/** Plain data for a server component that needs one product’s rows only. */
export async function getComparisonRows(product: string): Promise<{
  rows: ComparisonRow[];
  profile?: string;
  disclaimer: string;
  updatedAt: string;
  adjusted: boolean;
}> {
  const payload = await getComparison();
  return {
    rows: payload.products[product] ?? [],
    profile: payload.profiles[product],
    disclaimer: payload.disclaimer,
    updatedAt: payload.updatedAt,
    adjusted: payload.adjustedByBrokerTeam.includes(product),
  };
}
