import { redirect } from "next/navigation";
import { getBreeder } from "@/lib/breeder";
import ComingSoon from "../ComingSoon";

export default async function SeasonsPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  return (
    <ComingSoon
      title="Seasons"
      description="A kennel-wide view of every bitch's heat cycles and progesterone tests. For now, you can record and track seasons from each dog's profile."
    />
  );
}
