import { ConfirmationView } from "@/components/intake/confirmation-view";
import { SEED_MAX_REFERENCE } from "@/lib/store/seed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request sent",
  description: "Your service request has been sent to the office.",
};

/**
 * Static export needs the parameter set at build time, and the demo's reference
 * numbers are deterministic and sequential — so we pre-render the seeded
 * references plus a generous forward window. On a Node deployment this list is
 * only a warm-up: `dynamicParams` defaults to true, so any reference renders on
 * demand.
 */
export function generateStaticParams() {
  const first = SEED_MAX_REFERENCE - 20;
  const last = SEED_MAX_REFERENCE + 80;
  const params: { id: string }[] = [];
  for (let n = first; n <= last; n++) params.push({ id: `KSD-${n}` });
  return params;
}

export default async function RequestConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ConfirmationView id={id} />;
}
