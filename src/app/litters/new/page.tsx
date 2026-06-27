import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import NewLitterForm from "./NewLitterForm";

export default async function NewLitterPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  // Load the breeder's adult dogs so the form can offer dam/sire pickers.
  const dogs = await prisma.dog.findMany({
    where: {
      breederId: breeder.id,
      deletedAt: null,
      puppyRecord: null, // exclude puppies
    },
    orderBy: { callName: "asc" },
    select: { id: true, callName: true, sex: true, breed: true },
  });

  const dams = dogs.filter((d) => d.sex === "bitch");
  const sires = dogs.filter((d) => d.sex === "dog");

  return (
    <main className="mx-auto max-w-md p-4">
      <NewLitterForm
        dams={dams.map((d) => ({ id: d.id, callName: d.callName ?? "Unnamed" }))}
        sires={sires.map((d) => ({ id: d.id, callName: d.callName ?? "Unnamed" }))}
      />
    </main>
  );
}
