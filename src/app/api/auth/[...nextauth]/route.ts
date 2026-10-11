/**
 * NextAuth route handler. Lives at /api/auth/*, which is the only place the
 * portal session is issued or destroyed.
 */
import { handlers } from "@/auth";

export const runtime = "nodejs";

export const { GET, POST } = handlers;
