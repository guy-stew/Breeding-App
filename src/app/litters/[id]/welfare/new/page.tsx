import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import WelfareCheckForm from "./WelfareCheckForm";

export default async function NewWelfareCheckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const { id } = await params;

  const litter = await prisma.litter.findFirst({
    where: { id, breederId: breeder.id, deletedAt: null },
    select: { id: true, name: true },
  });

  if (!litter) notFound();

  return (
    <div className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href={`/litters/${litter.id}`}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Back to {litter.name ?? "litter"}
        </Link>
        <h1 className="mt-1 text-lg font-medium">Record welfare check</h1>
      </header>

      <WelfareCheckForm litterId={litter.id} />
    </div>
  );
}
