/**
 * POST /api/claim/upload - supporting documents for a claim notification.
 *
 * Sub-route of /api/claim (brief section 9: "upload supporting documents to
 * Vercel Blob"). Files go to Vercel Blob with a random suffix and a pathname that
 * carries no client identity, and the returned record is what /api/claim then
 * stores against the claim reference.
 *
 * When BLOB_READ_WRITE_TOKEN is not configured the endpoint does not pretend to
 * store anything: it returns stored:false with a note telling the client to send
 * the documents by WhatsApp or email, and the claim itself can still be filed.
 */
import { NextResponse } from "next/server";
import { capabilities } from "@/lib/env";
import { getClientIp, rateLimit, pruneBuckets } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB per file
const MAX_FILES = 8;
const ALLOWED = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export async function POST(request: Request) {
  pruneBuckets();
  const ip = getClientIp(request);
  const limit = rateLimit(`upload:${ip}`, 40, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many uploads from this connection. Please send the documents on WhatsApp instead." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds), "Cache-Control": "no-store" } },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "The upload could not be read." }, { status: 400 });
  }

  const files = form.getAll("documents").filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ ok: false, error: "No files were attached." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { ok: false, error: `Please attach no more than ${MAX_FILES} documents at a time.` },
      { status: 400 },
    );
  }

  for (const file of files) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: `${file.name} is larger than 8MB. Please compress it or send it on WhatsApp.` },
        { status: 413 },
      );
    }
    if (file.type && !ALLOWED.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: `${file.name} is a ${file.type} file, which we cannot accept. PDF, JPG, PNG, Word, or Excel please.` },
        { status: 415 },
      );
    }
  }

  if (!capabilities.blob) {
    return NextResponse.json(
      {
        ok: false,
        stored: false,
        error:
          "Document storage is not configured on this deployment, so the files were not uploaded. Please send them to us on WhatsApp or by email and quote your claim reference.",
      },
      { status: 503 },
    );
  }

  try {
    const { put } = await import("@vercel/blob");
    const uploaded = [];

    for (const file of files) {
      // The pathname carries the date and a random suffix only: no client name,
      // no policy number, nothing personal in a URL.
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
      const blob = await put(`claims/${new Date().toISOString().slice(0, 10)}/${safeName}`, file, {
        access: "public",
        addRandomSuffix: true,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      uploaded.push({
        name: file.name,
        size: file.size,
        type: file.type,
        url: blob.url,
        pathname: blob.pathname,
      });
    }

    return NextResponse.json({ ok: true, stored: true, files: uploaded });
  } catch (error) {
    console.error("[api/claim/upload] blob upload failed", error);
    return NextResponse.json(
      {
        ok: false,
        stored: false,
        error:
          "The documents could not be uploaded. You can still submit the claim and our team will ask you to send them on WhatsApp.",
      },
      { status: 502 },
    );
  }
}
