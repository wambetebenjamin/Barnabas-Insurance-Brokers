/**
 * NextAuth v5 (beta) for the client portal, using email OTP.
 *
 * Sign in is: email address + policy reference number, then the six digit code we
 * email. The Credentials provider validates the code against the hashed record in
 * KV (src/lib/otp.ts). Sessions are JWTs with an eight hour life, so the Edge
 * middleware can protect /portal without a database call on every request.
 *
 * AUTH_SECRET must be set in every environment. Without it NextAuth cannot sign
 * tokens and the portal refuses to issue a session.
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { verifyOtp } from "@/lib/otp";
import { portalVerifyOtpSchema } from "@/lib/schemas";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "email-otp",
      name: "Email one time code",
      credentials: {
        email: { label: "Email address", type: "email" },
        code: { label: "Six digit code", type: "text" },
        policyReference: { label: "Policy reference", type: "text" },
      },
      async authorize(raw) {
        const parsed = portalVerifyOtpSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase().trim();
        const result = await verifyOtp(email, parsed.data.code);
        if (!result.ok) {
          console.info(`[auth] OTP rejected for ${email.slice(0, 3)}***: ${result.reason}`);
          return null;
        }

        const policyReference =
          typeof raw?.policyReference === "string" ? raw.policyReference : undefined;

        return {
          id: email,
          email,
          name: email,
          policyReference,
        };
      },
    }),
  ],
});

/** Server helper for pages that need to know who is signed in. */
export const currentUser = async () => {
  const session = await auth();
  return session?.user ?? null;
};
