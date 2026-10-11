/**
 * Shared API helpers: JSON responses, client IP, rate limiting, admin auth.
 */
import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });

export const badRequest = (error: string, extra: Record<string, unknown> = {}) =>
  json({ ok: false, error, ...extra }, 400);

export const forbidden = (error: string, extra: Record<string, unknown> = {}) =>
  json({ ok: false, error, ...extra }, 403);

export const serverError = (error: string, extra: Record<string, unknown> = {}) =>
  json({ ok: false, error, ...extra }, 500);

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/* ---------------------------------------------------------- rate limiting */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Simple fixed-window limiter, per instance.
 *
 * This is a first line of defence for form endpoints, not a distributed rate
 * limiter: on Vercel each serverless instance keeps its own map, so the effective
 * limit is (limit x instances). It stops a naive flood and the repeated
 * submissions a bored visitor produces; reCAPTCHA remains the real control.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return { ok: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}

/** Housekeeping so the map cannot grow without bound in a long lived process. */
export function pruneBuckets(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

/* --------------------------------------------------------------- admin auth */

export function isAdmin(request: Request): boolean {
  if (!serverEnv.adminToken) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return false;
  // Constant-time-ish comparison, and never log either value.
  if (token.length !== serverEnv.adminToken.length) return false;
  let mismatch = 0;
  for (let index = 0; index < token.length; index += 1) {
    mismatch |= token.charCodeAt(index) ^ serverEnv.adminToken.charCodeAt(index);
  }
  return mismatch === 0;
}

/** The pre-filled wa.me link the client can tap when an API call is rejected. */
export const fallbackWhatsApp = (reference?: string): string => {
  const text = reference
    ? `Hello Barnabas Insurance Brokers. My reference is ${reference}.`
    : "Hello! I would like a free insurance quote from Barnabas Insurance Brokers.";
  return `https://wa.me/254112272061?text=${encodeURIComponent(text)}`;
};
