/**
 * GET /api/portal/documents?policy=<reference> - policy schedule PDF.
 *
 * Session required, and the requested reference must belong to the signed-in
 * client, so a valid session cannot be used to pull somebody else’s schedule.
 * The PDF is generated on demand from the stored schedule: there is no public
 * file to leak.
 */
import { auth } from "@/auth";
import { forbidden, badRequest } from "@/lib/api";
import { getPolicies } from "@/lib/portal";
import { buildPdf } from "@/lib/pdf";
import { SITE } from "@/lib/site";
import { formatDate, formatKes } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!session || !email) {
    return forbidden("Sign in to download your documents.");
  }

  const reference = new URL(request.url).searchParams.get("policy");
  if (!reference) {
    return badRequest("Specify the policy reference, for example ?policy=BIB-P-250011-A1B2");
  }

  const { policies } = await getPolicies(email);
  const policy = policies.find(
    (item) =>
      item.reference.toLowerCase() === reference.toLowerCase() ||
      item.policyNumber.toLowerCase() === reference.toLowerCase(),
  );

  if (!policy) {
    return forbidden("That policy is not on this account.");
  }

  const clientName = session.user?.name ?? email;

  const pdf = buildPdf([
    { kind: "title", text: "Barnabas Insurance Brokers" },
    { kind: "small", text: `Independent insurance brokers, Nairobi, Kenya. Licensed by IRA Kenya, licence number ${SITE.iraLicenseNumber}. Member of the Association of Kenya Insurers (${SITE.akiMemberNumber}).` },
    { kind: "space" },
    { kind: "heading", text: "Policy schedule" },
    { kind: "row", label: "Policy holder", value: clientName },
    { kind: "row", label: "Policy reference", value: policy.reference },
    { kind: "row", label: "Policy number", value: policy.policyNumber },
    { kind: "row", label: "Insurer", value: policy.insurer },
    { kind: "row", label: "Cover", value: policy.product },
    { kind: "row", label: "Status", value: policy.status === "active" ? "Active" : policy.status === "due-for-renewal" ? "Due for renewal" : "Lapsed" },
    { kind: "space" },
    { kind: "heading", text: "Cover details" },
    { kind: "row", label: "Summary", value: policy.coverSummary },
    { kind: "row", label: "Sum insured", value: formatKes(policy.sumInsured) },
    { kind: "row", label: "Premium", value: `${formatKes(policy.premium)} ${policy.premiumFrequency}` },
    { kind: "row", label: "Cover start", value: formatDate(policy.startDate) },
    { kind: "row", label: "Renewal date", value: formatDate(policy.renewalDate) },
    ...(policy.dependants && policy.dependants.length > 0
      ? [{ kind: "row" as const, label: "Dependants", value: policy.dependants.join(", ") }]
      : []),
    { kind: "space" },
    { kind: "heading", text: "Benefits included" },
    ...policy.benefits.map((benefit) => ({ kind: "body" as const, text: `- ${benefit}` })),
    { kind: "space" },
    { kind: "heading", text: "Documents on this policy" },
    ...policy.documents.map((document) => ({
      kind: "row" as const,
      label: document.kind,
      value: `${document.name} (updated ${formatDate(document.updatedAt)})`,
    })),
    { kind: "space" },
    { kind: "heading", text: "Your broker" },
    { kind: "row", label: "Contact", value: policy.broker.name },
    { kind: "row", label: "Phone", value: policy.broker.phone },
    { kind: "row", label: "Email", value: policy.broker.email },
    { kind: "space" },
    { kind: "rule" },
    { kind: "small", text: "Barnabas Insurance Brokers advises and places cover. The insurer pays claims. This schedule is a summary issued as a convenience copy from the client portal. The insurer’s policy document and schedule govern the contract of insurance, including all conditions, exclusions and warranties." },
    { kind: "small", text: `Generated on ${formatDate(new Date())} from the Barnabas Insurance Brokers client portal. If any detail here differs from your insurer’s schedule, the insurer’s schedule applies and you should tell us immediately.` },
    { kind: "space" },
    { kind: "small", text: `Data protection: this document contains personal and financial information. Store it securely and do not share it. Kenya Data Protection Act 2019.` },
  ]);

  const filename = `Barnabas-${policy.reference}-schedule.pdf`;

  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, max-age=0, must-revalidate",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
