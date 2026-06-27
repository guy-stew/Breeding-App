import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import AddPuppyForm from "./AddPuppyForm";

export default async function AddPuppyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const { id } = await params;

  const litter = await prisma.litter.findFirst({
    where: { id, breederId: breeder.id, deletedAt: null },
    include: {
      puppies: { where: { deletedAt: null }, select: { id: true } },
    },
  });

  if (!litter) notFound();

  const nextOrder = litter.puppies.length + 1;

  return (
    <main className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href={`/litters/${litter.id}`}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Back to {litter.name ?? "litter"}
        </Link>
        <h1 className="mt-1 text-lg font-medium">Add a puppy</h1>
      </header>

      <AddPuppyForm litterId={litter.id} nextOrder={nextOrder} />
    </main>
  );
}
