/**
 * Comparison types and labels.
 *
 * Split out of `@/lib/comparison` on purpose: `comparison.ts` reads the broker
 * override from Vercel KV, which pulls in `node:fs` through the storage module and
 * therefore cannot be imported by a client component. This module is plain data
 * and types, so `ComparisonTool` can use it in the browser without dragging any
 * server code into the bundle.
 */
import dataset from "@/data/insurers.json";

export interface ComparisonRow {
  insurer: string;
  plan: string;
  premiumFrom: number;
  premiumTo: number;
  cycle: "month" | "trip" | "year";
  coverageLimit: string;
  excess: string;
  benefits: string[];
  highlight?: boolean;
}

export type ComparisonProduct = keyof typeof dataset.products;

/** Committed dataset, without the broker overrides that only the server can read. */
export const BASE_PRODUCTS = dataset.products as unknown as Record<string, ComparisonRow[]>;

export const CYCLE_LABEL: Record<ComparisonRow["cycle"], string> = {
  month: "per month",
  trip: "per trip",
  year: "per year",
};
