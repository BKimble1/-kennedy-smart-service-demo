import { RequestDetail } from "@/components/dashboard/request-detail";
import { SEED_MAX_REFERENCE } from "@/lib/store/seed";

export function generateStaticParams() {
  const params: { id: string }[] = [];
  for (let n = SEED_MAX_REFERENCE - 20; n <= SEED_MAX_REFERENCE + 80; n++) {
    params.push({ id: `KSD-${n}` });
  }
  return params;
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestDetail id={id} />;
}
