/**
 * /api/comparison - the insurer comparison dataset (brief section 7 and backend).
 *
 * GET  returns the dataset, optionally filtered to one product.
 * PUT  lets the broker team update it, authorised by the ADMIN_TOKEN bearer token.
 *
 * The dataset ships in the repository as src/data/insurers.json, which is the
 * source of truth. Updates submitted through PUT are stored in Vercel KV as
 * overrides and merged on read, so a rate correction takes effect immediately
 * without a redeploy and without the team editing a JSON file in GitHub.
 *
 * GET is cacheable at the edge for five minutes with stale-while-revalidate,
 * because it contains nothing personal: it is insurer names, premiums and
 * benefit wording only.
 */
import { NextResponse } from "next/server";
import dataset from "@/data/insurers.json";
import { z } from "zod";
import { getJson, setJson, KEYS, backendName } from "@/lib/store";
import { isAdmin, json, badRequest, forbidden } from "@/lib/api";
import { INSURANCE_TYPES } from "@/lib/schemas";

export const runtime = "nodejs";

const rowSchema = z.object({
  insurer: z.string().trim().min(2).max(120),
  plan: z.string().trim().min(2).max(120),
  premiumFrom: z.number().nonnegative(),
  premiumTo: z.number().nonnegative(),
  cycle: z.enum(["month", "trip", "year"]),
  coverageLimit: z.string().trim().max(600),
  excess: z.string().trim().max(400),
  benefits: z.array(z.string().trim().max(300)).min(1).max(10),
  highlight: z.boolean().optional(),
});

const overrideSchema = z.object({
  product: z.enum(INSURANCE_TYPES as [string, ...string[]]),
  rows: z.array(rowSchema).min(1).max(12),
  updatedBy: z.string().trim().max(120).optional(),
});

type Row = z.infer<typeof rowSchema>;
type Overrides = Partial<Record<string, Row[]>>;

const base = dataset.products as unknown as Record<string, Row[]>;

async function merged(): Promise<Record<string, Row[]>> {
  const overrides = (await getJson<Overrides>(KEYS.comparisonOverrides)) ?? {};
  const output: Record<string, Row[]> = { ...base };
  for (const [product, rows] of Object.entries(overrides)) {
    if (rows && rows.length > 0) output[product] = rows;
  }
  return output;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const product = url.searchParams.get("product");
  const products = await merged();

  const overrides = (await getJson<Overrides>(KEYS.comparisonOverrides)) ?? {};
  const overridden = Object.keys(overrides).filter((key) => (overrides[key] ?? []).length > 0);

  const payload = {
    ok: true,
    version: dataset.version,
    currency: dataset.currency,
    updatedAt: dataset.updatedAt,
    disclaimer: dataset.disclaimer,
    maintainedBy: dataset.maintainedBy,
    profiles: dataset.profiles,
    adjustedByBrokerTeam: overridden,
    storage: backendName(),
    products: product && products[product] ? { [product]: products[product] } : products,
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}

export async function PUT(request: Request) {
  if (!isAdmin(request)) {
    return forbidden(
      "Updating the comparison dataset requires the ADMIN_TOKEN bearer token. Set ADMIN_TOKEN in the Vercel project and send it as 'Authorization: Bearer <token>'.",
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("The request body was not valid JSON.");
  }

  const parsed = overrideSchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest("The comparison rows were not valid.", {
      fieldErrors: parsed.error.issues.reduce<Record<string, string>>((accumulator, issue) => {
        const key = issue.path.join(".");
        if (!accumulator[key]) accumulator[key] = issue.message;
        return accumulator;
      }, {}),
    });
  }

  const existing = (await getJson<Overrides>(KEYS.comparisonOverrides)) ?? {};
  const updated: Overrides = {
    ...existing,
    [parsed.data.product]: parsed.data.rows,
  };

  const result = await setJson(KEYS.comparisonOverrides, {
    ...updated,
    // Written alongside so the team can see when a rate was last touched.
    _meta: { updatedAt: new Date().toISOString(), updatedBy: parsed.data.updatedBy ?? "broker team" },
  });

  return json({
    ok: true,
    product: parsed.data.product,
    rows: parsed.data.rows.length,
    storage: result.backend,
    stored: result.stored,
    message: `Comparison rows for ${parsed.data.product} updated. The site will show them on the next request.`,
  });
}

export async function POST() {
  return badRequest("Use PUT with an ADMIN_TOKEN bearer token to update comparison rows.");
}
