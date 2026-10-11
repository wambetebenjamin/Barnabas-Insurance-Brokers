/**
 * MDX guides.
 *
 * Articles live in src/content/guides/*.mdx as plain MDX with front matter, read
 * from disk at build and ISR time. The pages that render them use
 * revalidate = 3600, so publishing a new file (or a broker editing an existing
 * one) updates the site within an hour of the next deploy, without a rebuild of
 * every route.
 *
 * Rendering happens in a server component through next-mdx-remote/rsc, so the
 * MDX never ships to the browser as a hydration payload.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "guides");

export interface GuideMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  category: string;
  readingMinutes: number;
  relatedProduct?: string;
  image?: string;
  keywords?: string[];
}

export interface Guide extends GuideMeta {
  body: string;
}

const required = ["title", "description", "publishedAt", "author", "category"] as const;

const toMeta = (slug: string, data: Record<string, unknown>): GuideMeta => {
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Guide "${slug}" is missing the front matter field "${field}".`);
    }
  }
  return {
    slug,
    title: String(data.title),
    description: String(data.description),
    publishedAt: String(data.publishedAt),
    updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
    author: String(data.author),
    category: String(data.category),
    readingMinutes: Number(data.readingMinutes ?? 0) || 1,
    relatedProduct: data.relatedProduct ? String(data.relatedProduct) : undefined,
    image: data.image ? String(data.image) : undefined,
    keywords: Array.isArray(data.keywords) ? (data.keywords as string[]) : undefined,
  };
};

const readingTime = (body: string): number =>
  Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));

export async function getAllGuides(): Promise<GuideMeta[]> {
  let files: string[] = [];
  try {
    files = await fs.readdir(CONTENT_DIR);
  } catch {
    return [];
  }

  const guides = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
        const { data, content } = matter(raw);
        const slug = file.replace(/\.mdx$/, "");
        const meta = toMeta(slug, data);
        return { ...meta, readingMinutes: meta.readingMinutes || readingTime(content) };
      }),
  );

  return guides.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getGuide(slug: string): Promise<Guide | null> {
  // Guard against path traversal: the slug must be a simple file name.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const raw = await fs.readFile(path.join(CONTENT_DIR, `${slug}.mdx`), "utf8");
    const { data, content } = matter(raw);
    const meta = toMeta(slug, data);
    return { ...meta, body: content, readingMinutes: meta.readingMinutes || readingTime(content) };
  } catch {
    return null;
  }
}

export async function getGuideSlugs(): Promise<string[]> {
  try {
    const files = await fs.readdir(CONTENT_DIR);
    return files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, ""));
  } catch {
    return [];
  }
}

export const GUIDES_CATEGORIES = ["Health", "Motor", "Life", "Claims"] as const;
