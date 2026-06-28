import { redirect } from "next/navigation";
import { getBreeder } from "@/lib/breeder";
import ComingSoon from "../ComingSoon";

export default async function GrowthPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  return (
    <ComingSoon
      title="Growth"
      description="Combined growth charts across all your litters, with weight trends and milestones. For now, growth charts live on the dashboard and each litter's page."
    />
  );
}
