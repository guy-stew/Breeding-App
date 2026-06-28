import { redirect } from "next/navigation";
import { getBreeder } from "@/lib/breeder";
import ComingSoon from "../ComingSoon";

export default async function ContractsPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  return (
    <ComingSoon
      title="Contracts"
      description="A central library of every puppy sale contract you've generated. For now, contracts are created and printed from each puppy's or buyer's profile."
    />
  );
}
