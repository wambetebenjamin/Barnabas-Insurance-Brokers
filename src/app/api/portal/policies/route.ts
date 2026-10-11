/**
 * GET /api/portal/policies - the signed-in client’s active policies.
 *
 * Session required. Never cached, never indexed, and the client’s email address is
 * never echoed back in the payload, only used to look the schedules up.
 */
import { auth } from "@/auth";
import { json, forbidden } from "@/lib/api";
import { getPolicies } from "@/lib/portal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;

  if (!session || !email) {
    return forbidden("Sign in to view your policies.");
  }

  const result = await getPolicies(email);

  return json({
    ok: true,
    policies: result.policies,
    count: result.policies.length,
    source: result.source,
    sampleLabel: result.sampleLabel,
    serverTime: new Date().toISOString(),
  });
}
