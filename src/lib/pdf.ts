/**
 * Minimal PDF writer.
 *
 * The client portal has to hand a client a policy schedule PDF. Rather than pull a
 * PDF library into the locked stack, this writes a small, valid PDF 1.4 document
 * using the two standard Helvetica fonts, which every reader has built in.
 *
 * Supports exactly what a schedule needs: headings, body lines, key/value rows,
 * rules, and page breaks. It is deliberately not a general purpose renderer.
 */

type Line =
  | { kind: "title"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "body"; text: string }
  | { kind: "small"; text: string }
  | { kind: "rule" }
  | { kind: "space" }
  | { kind: "row"; label: string; value: string };

const PAGE_WIDTH = 595.28; // A4 at 72dpi
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 50;
const TOP = PAGE_HEIGHT - 60;
const BOTTOM = 60;

/** Escape the three characters that are special inside a PDF string. */
const esc = (value: string): string =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    // WinAnsi is the encoding of the standard fonts; anything outside it is
    // transliterated so the document never renders as boxes.
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E]/g, "-");

const measure = (text: string, size: number): number => text.length * size * 0.5;

/** Rough word wrap into the printable width. */
const wrap = (text: string, size: number, width: number): string[] => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate, size) > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
};

export function buildPdf(lines: Line[]): Buffer {
  const pages: string[] = [];
  let content = "";
  let y = TOP;

  const newPage = () => {
    pages.push(content);
    content = "";
    y = TOP;
  };

  const write = (text: string, size: number, bold = false, indent = 0) => {
    content += `BT /${bold ? "F2" : "F1"} ${size} Tf ${(MARGIN_X + indent).toFixed(2)} ${y.toFixed(2)} Td (${esc(text)}) Tj ET\n`;
  };

  const rule = () => {
    content += `0.85 0.87 0.93 RG 0.7 w ${MARGIN_X} ${y.toFixed(2)} m ${(PAGE_WIDTH - MARGIN_X).toFixed(2)} ${y.toFixed(2)} l S\n`;
  };

  const ensure = (needed: number) => {
    if (y - needed < BOTTOM) newPage();
  };

  for (const line of lines) {
    switch (line.kind) {
      case "title": {
        ensure(46);
        write(line.text, 18, true);
        y -= 26;
        break;
      }
      case "heading": {
        ensure(40);
        y -= 10;
        write(line.text, 13, true);
        y -= 18;
        rule();
        y -= 16;
        break;
      }
      case "body": {
        const wrapped = wrap(line.text, 10.5, PAGE_WIDTH - MARGIN_X * 2);
        ensure(wrapped.length * 15 + 4);
        for (const part of wrapped) {
          if (y < BOTTOM) newPage();
          write(part, 10.5);
          y -= 15;
        }
        y -= 3;
        break;
      }
      case "small": {
        const wrapped = wrap(line.text, 9, PAGE_WIDTH - MARGIN_X * 2);
        ensure(wrapped.length * 13 + 4);
        for (const part of wrapped) {
          if (y < BOTTOM) newPage();
          write(part, 9);
          y -= 13;
        }
        y -= 4;
        break;
      }
      case "row": {
        const valueLines = wrap(line.value, 11, PAGE_WIDTH - MARGIN_X * 2 - 190);
        ensure(Math.max(valueLines.length, 1) * 15 + 4);
        write(line.label, 10, false);
        valueLines.forEach((part, index) => {
          content += `BT /F2 11 Tf ${(MARGIN_X + 190).toFixed(2)} ${(y - index * 15).toFixed(2)} Td (${esc(part)}) Tj ET\n`;
        });
        y -= Math.max(valueLines.length, 1) * 15 + 3;
        break;
      }
      case "rule": {
        ensure(14);
        y -= 8;
        rule();
        y -= 12;
        break;
      }
      case "space": {
        y -= 12;
        break;
      }
    }
  }

  pages.push(content);

  /* ------------------------------------------------------------- assembly */

  const objects: string[] = [];
  const pageCount = pages.length;
  // 1 catalog, 2 pages, 3..(3+pageCount-1) page objects, then content streams,
  // then the two fonts.
  const firstPageObject = 3;
  const firstContentObject = firstPageObject + pageCount;
  const fontRegular = firstContentObject + pageCount;
  const fontBold = fontRegular + 1;

  const kids = Array.from({ length: pageCount }, (_, index) => `${firstPageObject + index} 0 R`).join(" ");

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`;

  for (let index = 0; index < pageCount; index += 1) {
    objects[firstPageObject + index] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> ` +
      `/Contents ${firstContentObject + index} 0 R >>`;
  }

  for (let index = 0; index < pageCount; index += 1) {
    const stream = pages[index];
    objects[firstContentObject + index] =
      `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}endstream`;
  }

  objects[fontRegular] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[fontBold] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  for (let index = 1; index < objects.length; index += 1) {
    const object = objects[index];
    if (!object) continue;
    offsets[index] = Buffer.byteLength(pdf, "latin1");
    pdf += `${index} 0 obj\n${object}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  const total = objects.length;
  pdf += `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let index = 1; index < total; index += 1) {
    const offset = offsets[index] ?? 0;
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${total} /Root 1 0 R /Info << /Producer (Barnabas Insurance Brokers) /Creator (Barnabas Insurance Brokers client portal) >> >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}
