/**
 * GET /api/guides - the MDX guide index (brief backend list).
 *
 * The guides themselves are rendered at /guides/[slug] with ISR. This endpoint
 * exposes the same metadata for anything else that needs it, and accepts
 * ?slug=<slug> for a single article’s front matter plus its raw MDX body.
 */
import { getAllGuides, getGuide } from "@/lib/guides";
import { json } from "@/lib/api";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");

  if (slug) {
    const guide = await getGuide(slug);
    if (!guide) return json({ ok: false, error: `No guide found for slug "${slug}".` }, 404);
    return json({ ok: true, guide });
  }

  const guides = await getAllGuides();

  return new Response(
    JSON.stringify({ ok: true, count: guides.length, guides }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
