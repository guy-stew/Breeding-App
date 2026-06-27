import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import NewHeatCycleForm from "./NewHeatCycleForm";

export default async function NewHeatCyclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const { id } = await params;

  const dog = await prisma.dog.findFirst({
    where: { id, breederId: breeder.id, deletedAt: null, sex: "bitch" },
    select: { id: true, callName: true },
  });

  if (!dog) notFound();

  return (
    <div className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href={`/dogs/${dog.id}`}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Back to {dog.callName ?? "dog"}
        </Link>
        <h1 className="mt-1 text-lg font-medium">Record heat cycle</h1>
      </header>

      <NewHeatCycleForm dogId={dog.id} />
    </div>
  );
}
