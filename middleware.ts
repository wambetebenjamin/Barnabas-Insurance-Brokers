/**
 * Edge middleware.
 *
 * Two jobs:
 *   1. Block /portal (and everything under it except /portal/login) without a
 *      session. The decision comes from the JWT session cookie through the shared
 *      `authorized` callback in auth.config.ts, so pages and API routes agree.
 *   2. Add a no-index header to anything that must never appear in a search
 *      engine: the portal, the design reference copies of the original template,
 *      and the API routes that carry client data.
 */
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;

  // No session and not the login page: send them to sign in, remembering where
  // they were going so the portal can return them there.
  if (pathname.startsWith("/portal") && !pathname.startsWith("/portal/login")) {
    if (!request.auth) {
      const url = new URL("/portal/login", request.nextUrl.origin);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();

  if (pathname.startsWith("/portal") || pathname.startsWith("/design-reference")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  if (pathname.startsWith("/portal") || pathname.startsWith("/api/portal")) {
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  }

  return response;
});

export const config = {
  matcher: ["/portal/:path*", "/design-reference/:path*", "/api/portal/:path*"],
};
