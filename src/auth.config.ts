/**
 * Edge safe half of the NextAuth configuration.
 *
 * middleware.ts runs on the Edge runtime, so it can only import this file: the
 * Credentials provider (which reaches for SMTP, KV and node:crypto) lives in
 * auth.ts instead. Both share the same callbacks, so the `authorized` decision
 * made at the edge is the same one the server makes.
 *
 * Session strategy is JWT, which means the Edge middleware can verify the session
 * without a database round trip.
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // eight hours
  },
  pages: {
    signIn: "/portal/login",
    error: "/portal/login",
  },
  providers: [], // filled in by auth.ts
  callbacks: {
    /**
     * Guards /portal at the edge (brief: "Edge middleware blocks /portal without
     * session"). Everything under /portal except the login page needs a session.
     */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user);

      if (pathname.startsWith("/portal") && !pathname.startsWith("/portal/login")) {
        return isLoggedIn;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.policyReference = (user as { policyReference?: string }).policyReference;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string) ?? session.user.name;
        (session.user as { policyReference?: string }).policyReference = token.policyReference as
          | string
          | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
