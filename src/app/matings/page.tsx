import { redirect } from "next/navigation";
import { getBreeder } from "@/lib/breeder";
import ComingSoon from "../ComingSoon";

export default async function MatingsPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  return (
    <ComingSoon
      title="Matings"
      description="A dedicated record of every planned and completed mating, with COI and breed-average tracking. For now, matings are recorded as part of creating a litter."
    />
  );
}
