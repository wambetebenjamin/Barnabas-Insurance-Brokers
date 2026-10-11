"use client";

/**
 * Insurance comparison tool (brief section 7).
 *
 * Select a product category, enter the key details, and compare up to three
 * insurers side by side. The results table carries exactly the columns the brief
 * names: insurer name, monthly premium, coverage limit, excess, key benefits, and
 * a Get This Plan call to action that opens the quotation form with the product
 * and insurer already filled in.
 *
 * The table scrolls horizontally on mobile (with a visible hint), and every row
 * states that the figure is indicative. We do not invent a premium for a profile
 * the insurer has not priced.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { PRODUCTS, type ProductSlug } from "@/data/products";
import type { ComparisonRow } from "@/lib/comparison-shared";
import { CYCLE_LABEL } from "@/lib/comparison-shared";
import { formatKes } from "@/lib/format";
import { COUNTIES, whatsappLink } from "@/lib/site";
import { Field, Input, Select } from "@/components/forms/Fields";

interface Props {
  products: Record<string, ComparisonRow[]>;
  profiles: Record<string, string>;
  disclaimer: string;
  updatedAt: string;
  adjusted: string[];
  initialProduct?: ProductSlug;
  /** Rows only, for the embedded version on a product page. */
  lockProduct?: boolean;
}

const MAX_COMPARE = 3;

const DETAIL_FIELD: Record<
  string,
  { label: string; hint: string; type: "number" | "text"; placeholder: string; prefix?: string }
> = {
  "motor-insurance": {
    label: "Vehicle value (KES)",
    hint: "Your figure may fall outside the published band. We confirm the exact rate with the insurer.",
    type: "number",
    placeholder: "2500000",
  },
  "health-and-medical": {
    label: "Number of people to cover",
    hint: "Family rates depend on ages. Tell us the ages in the quotation form.",
    type: "number",
    placeholder: "4",
  },
  "life-insurance": {
    label: "Sum assured you need (KES)",
    hint: "Term life rates follow the sum assured and your age.",
    type: "number",
    placeholder: "5000000",
  },
  "home-and-property": {
    label: "Property value (KES)",
    hint: "Use the reinstatement cost for the building, contents separately.",
    type: "number",
    placeholder: "8000000",
  },
  "business-insurance": {
    label: "Number of employees",
    hint: "Staff numbers drive the WIBA and group medical element.",
    type: "number",
    placeholder: "12",
  },
  "travel-insurance": {
    label: "Days of travel",
    hint: "Premium follows the number of days and the destination.",
    type: "number",
    placeholder: "10",
  },
};

export function ComparisonTool({
  products,
  profiles,
  disclaimer,
  updatedAt,
  adjusted,
  initialProduct,
  lockProduct = false,
}: Props) {
  const availableProducts = useMemo(
    () => PRODUCTS.filter((product) => (products[product.slug] ?? []).length > 0),
    [products],
  );

  const [productSlug, setProductSlug] = useState<ProductSlug>(
    initialProduct && products[initialProduct] ? initialProduct : availableProducts[0]?.slug,
  );
  const [detail, setDetail] = useState("");
  const [county, setCounty] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const rows = products[productSlug] ?? [];
  const product = PRODUCTS.find((item) => item.slug === productSlug);
  const detailField = DETAIL_FIELD[productSlug];

  const visibleRows = selected.length > 0 ? rows.filter((row) => selected.includes(row.insurer)) : rows;

  const toggleInsurer = (insurer: string) => {
    setSelected((current) => {
      if (current.includes(insurer)) return current.filter((item) => item !== insurer);
      if (current.length >= MAX_COMPARE) return [...current.slice(1), insurer];
      return [...current, insurer];
    });
  };

  return (
    <div>
      <div className="row g-4 align-items-end" style={{ marginBottom: 26 }}>
        {!lockProduct ? (
          <div className="col-lg-4">
            <Field label="Insurance type" htmlFor="compare-product">
              <Select
                id="compare-product"
                value={productSlug}
                onChange={(event) => {
                  setProductSlug(event.target.value as ProductSlug);
                  setSelected([]);
                  setDetail("");
                }}
              >
                {availableProducts.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        ) : null}

        <div className="col-lg-4">
          <Field label={detailField.label} htmlFor="compare-detail" hint={detailField.hint}>
            <Input
              id="compare-detail"
              type={detailField.type}
              inputMode={detailField.type === "number" ? "numeric" : undefined}
              placeholder={detailField.placeholder}
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
            />
          </Field>
        </div>

        <div className="col-lg-4">
          <Field label="County" htmlFor="compare-county" hint="Rates and excesses can differ by region.">
            <Select id="compare-county" value={county} onChange={(event) => setCounty(event.target.value)}>
              <option value="">Select your county</option>
              {COUNTIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      {product ? (
        <p className="b-meta" style={{ color: "var(--b-ink-muted)", marginBottom: 14 }}>
          Indicative premiums for this profile: {profiles[productSlug]} Updated {updatedAt}.
          {adjusted.includes(productSlug)
            ? " Rates for this product were adjusted by our broker team after the last dataset release."
            : ""}
        </p>
      ) : null}

      <div style={{ marginBottom: 14 }}>
        <span className="b-fs-body-sm" style={{ color: "var(--b-dark)", fontWeight: 500 }}>
          Compare up to {MAX_COMPARE} insurers side by side
        </span>
        <div className="d-flex flex-wrap gap-2 mt-2">
          {rows.map((row) => {
            const isSelected = selected.includes(row.insurer);
            return (
              <button
                key={row.insurer}
                type="button"
                onClick={() => toggleInsurer(row.insurer)}
                aria-pressed={isSelected}
                className={`btn ${isSelected ? "btn-primary" : "b-btn-ghost"}`}
                style={{ fontSize: "max(11px, 0.6875rem)", minHeight: 44, padding: "8px 14px" }}
              >
                {isSelected ? "✓ " : "+ "}
                {row.insurer.split(" ")[0]}
              </button>
            );
          })}
          {selected.length > 0 ? (
            <button
              type="button"
              className="btn b-btn-ghost"
              style={{ fontSize: "max(11px, 0.6875rem)", minHeight: 44 }}
              onClick={() => setSelected([])}
            >
              Show all
            </button>
          ) : null}
        </div>
      </div>

      <div className="b-table-wrap" tabIndex={0} role="region" aria-label="Insurer comparison table">
        <table className="b-compare">
          <caption>
            {product?.name} comparison, {visibleRows.length} of {rows.length} insurers shown. Figures
            are indicative and are not an offer of cover.
          </caption>
          <thead>
            <tr>
              <th scope="col">Insurer and plan</th>
              <th scope="col">Premium</th>
              <th scope="col">Coverage limit</th>
              <th scope="col">Excess</th>
              <th scope="col">Key benefits</th>
              <th scope="col">
                <span className="b-visually-hidden">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={`${row.insurer}-${row.plan}`}>
                <th scope="row">
                  {row.insurer}
                  <br />
                  <span style={{ fontWeight: 400, color: "var(--b-ink)" }}>{row.plan}</span>
                  {row.highlight ? <span className="b-compare__best">Broker pick</span> : null}
                </th>
                <td>
                  <span className="b-premium">
                    {formatKes(row.premiumFrom)} to {formatKes(row.premiumTo)}
                  </span>
                  <br />
                  <span className="b-meta" style={{ color: "var(--b-ink-muted)" }}>
                    {CYCLE_LABEL[row.cycle]}
                  </span>
                </td>
                <td>{row.coverageLimit}</td>
                <td>{row.excess}</td>
                <td>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {row.benefits.map((benefit) => (
                      <li key={benefit} style={{ marginBottom: 6 }}>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <Link
                    href={`/quote?product=${productSlug}&insurer=${encodeURIComponent(row.insurer)}`}
                    className="btn btn-primary"
                    style={{ minHeight: 44, fontSize: "max(12px, 0.75rem)", whiteSpace: "nowrap" }}
                  >
                    Get This Plan
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="b-scroll-hint">
        <i className="bi bi-arrows-expand-vertical" aria-hidden="true" /> Scroll sideways to see every
        column.
      </p>

      <div className="b-legal-note" style={{ marginTop: 20 }}>
        {disclaimer}
      </div>

      <div className="b-formnav" style={{ borderTop: "none", paddingTop: 0 }}>
        <p className="mb-0 b-fs-body-sm" style={{ color: "var(--b-ink)", maxWidth: "56ch" }}>
          Want these figures checked against your exact details? A licensed broker will confirm real
          rates from the insurers, in writing.
        </p>
        <div className="d-flex gap-2 flex-wrap">
          <Link
            href={`/quote?product=${productSlug}${detail ? `&value=${encodeURIComponent(detail)}` : ""}${
              county ? `&county=${encodeURIComponent(county)}` : ""
            }`}
            className="btn btn-primary"
          >
            Get an exact quote
          </Link>
          <a
            className="btn b-btn-ghost"
            href={whatsappLink(
              `Hello Barnabas Insurance Brokers. Please compare ${product?.name ?? "insurance"} for me. My county is ${county || "not specified"}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-whatsapp" aria-hidden="true" /> Send this to a broker
          </a>
        </div>
      </div>
    </div>
  );
}
