import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import GrowthSwitcher, { type GrowthLitter } from "./GrowthSwitcher";

const DAY = 1000 * 60 * 60 * 24;

export default async function GrowthPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const litters = await prisma.litter.findMany({
    where: { deletedAt: null, breederId: breeder.id, puppies: { some: { deletedAt: null } } },
    orderBy: { whelpDate: "desc" },
    include: {
      mating: { include: { dam: { select: { callName: true } }, sire: { select: { callName: true } } } },
      puppies: {
        where: { deletedAt: null },
        orderBy: { birthOrder: "asc" },
        include: { dog: { include: { weightLogs: { where: { deletedAt: null }, orderBy: { date: "asc" } } } } },
      },
    },
  });

  const nowMs = new Date().getTime();
  const data: GrowthLitter[] = litters.map((l) => ({
    id: l.id,
    title:
      l.mating?.dam?.callName && l.mating?.sire?.callName
        ? `${l.mating.dam.callName} × ${l.mating.sire.callName}`
        : l.name ?? "Litter",
    whelpDate: l.whelpDate.toISOString(),
    day: Math.max(0, Math.floor((nowMs - l.whelpDate.getTime()) / DAY)),
    puppyCount: l.puppies.length,
    puppies: l.puppies.map((p) => ({
      collarColour: p.collarColour,
      callName: p.dog.callName,
      weights: p.dog.weightLogs.map((w) => ({ date: w.date.toISOString(), weightG: w.weightG })),
    })),
  }));

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Growth</h1>
        <p className="text-sm text-neutral-500">Weight curves for every litter — switch between them below.</p>
      </div>

      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">No litters with recorded weights yet.</p>
          <Link href="/weigh-in" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            Start a weigh-in round →
          </Link>
        </div>
      ) : (
        <GrowthSwitcher litters={data} />
      )}
    </div>
  );
}
