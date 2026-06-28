import { redirect } from "next/navigation";

// Season detail moved to /seasons/[cycleId]. Keep this path as a redirect so
// old links and bookmarks still resolve.
export default async function LegacyHeatCycleRedirect({
  params,
}: {
  params: Promise<{ id: string; cycleId: string }>;
}) {
  const { cycleId } = await params;
  redirect(`/seasons/${cycleId}`);
}
