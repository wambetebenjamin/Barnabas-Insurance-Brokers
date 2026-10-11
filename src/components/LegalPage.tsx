/**
 * Shared layout for the three legal pages.
 *
 * The design source has no legal pages at all (INVENTORY.md section 7), so these
 * are built on the source’s own `.page-header` breadcrumb head plus the additive
 * prose styles: a sticky table of contents on desktop, one column on mobile, and a
 * print stylesheet so a client can print or save the policy as a PDF.
 *
 * Inline formatting supported in the content: **bold**, *italic* and [links](path),
 * so the copy stays readable in the data file.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import { formatDate } from "@/lib/format";

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "ordered"; items: string[] }
  | { type: "sub"; text: string }
  | { type: "note"; text: string }
  | { type: "table"; head: string[]; rows: string[][] };

export interface LegalSection {
  id: string;
  heading: string;
  blocks: LegalBlock[];
}

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith("/")) {
        return (
          <Link key={index} href={href}>
            {label}
          </Link>
        );
      }
      return (
        <a key={index} href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHeader title={title} intro={intro} crumbs={[{ name: "Legal", href: "/legal/privacy-policy" }]}>
        <p className="b-meta" style={{ color: "rgba(255,255,255,.85)", marginTop: 14 }}>
          Last updated {formatDate(updated)}. This page applies to {SITE.name}, licensed by the
          Insurance Regulatory Authority of Kenya under licence {SITE.iraLicenseNumber}.
        </p>
      </PageHeader>

      <section className="b-section">
        <div className="container">
          <div className="row g-5">
            <aside className="col-lg-4">
              <nav className="b-toc" aria-label={`Contents of the ${title.toLowerCase()}`}>
                <h2>On this page</h2>
                <ol>
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`}>{section.heading}</a>
                    </li>
                  ))}
                </ol>
                <p className="b-meta mt-3 mb-0" style={{ color: "var(--b-ink-muted)" }}>
                  Questions about this policy? Email{" "}
                  <a href={SITE.emailHref}>{SITE.email}</a> or call {SITE.phone}.
                </p>
              </nav>
            </aside>

            <div className="col-lg-8">
              <div className="b-prose">
                {sections.map((section) => (
                  <section key={section.id} id={section.id}>
                    <h2>{section.heading}</h2>
                    {section.blocks.map((block, index) => {
                      switch (block.type) {
                        case "p":
                          return <p key={index}>{renderInline(block.text)}</p>;
                        case "sub":
                          return <h3 key={index}>{renderInline(block.text)}</h3>;
                        case "list":
                          return (
                            <ul key={index}>
                              {block.items.map((item) => (
                                <li key={item}>{renderInline(item)}</li>
                              ))}
                            </ul>
                          );
                        case "ordered":
                          return (
                            <ol key={index}>
                              {block.items.map((item) => (
                                <li key={item}>{renderInline(item)}</li>
                              ))}
                            </ol>
                          );
                        case "note":
                          return (
                            <p className="b-legal-note" key={index}>
                              {renderInline(block.text)}
                            </p>
                          );
                        case "table":
                          return (
                            <div className="b-table-wrap" key={index} style={{ margin: "20px 0" }}>
                              <table>
                                <thead>
                                  <tr>
                                    {block.head.map((cell) => (
                                      <th key={cell} scope="col">
                                        {cell}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {block.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                      {row.map((cell, cellIndex) => (
                                        <td key={cellIndex}>{renderInline(cell)}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
                  </section>
                ))}
              </div>

              <div className="b-legal-note" style={{ marginTop: 32 }}>
                This document is issued by {SITE.legalName}, {SITE.address}. Licensed by the Insurance
                Regulatory Authority of Kenya, licence no {SITE.iraLicenseNumber}. Member of the
                Association of Kenya Insurers, {SITE.akiMemberNumber}. We advise and place cover, and
                the insurer pays claims.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
