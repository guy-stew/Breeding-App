import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import SignOutButton from "./SignOutButton";
import DashboardLitters from "./DashboardLitters";

function dayOfLitter(whelpDate: Date): number {
  const ms = Date.now() - whelpDate.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export default async function HomePage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const totalDogs = await prisma.dog.count({
    where: {
      deletedAt: null,
      breederId: breeder.id,
      puppyRecord: null,
    },
  });

  const activeLitters = await prisma.litter.findMany({
    where: {
      deletedAt: null,
      breederId: breeder.id,
      status: { not: "all_homed" },
    },
    orderBy: { whelpDate: "desc" },
    include: {
      puppies: {
        where: { deletedAt: null },
        orderBy: { birthOrder: "asc" },
        include: {
          dog: {
            include: {
              weightLogs: {
                where: { deletedAt: null },
                orderBy: { date: "asc" },
              },
            },
          },
        },
      },
    },
  });

  const totalPuppies = activeLitters.reduce(
    (sum, l) => sum + l.puppies.length,
    0,
  );

  // Shape litter data for the client component.
  const litterData = activeLitters.map((litter) => ({
    id: litter.id,
    name: litter.name,
    whelpDate: litter.whelpDate.toISOString(),
    bornAlive: litter.bornAlive,
    day: dayOfLitter(litter.whelpDate),
    puppies: litter.puppies.map((p) => ({
      collarColour: p.collarColour,
      callName: p.dog.callName,
      weights: p.dog.weightLogs.map((w) => ({
        date: w.date.toISOString(),
        weightG: w.weightG,
      })),
    })),
  }));

  return (
    <div className="mx-auto max-w-md p-4">
      {/* Welcome + sign out */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Welcome back
          </h2>
          <p className="text-xs text-neutral-500">
            {breeder.kennelName ?? "My kennel"}
          </p>
        </div>
        <SignOutButton />
      </div>

      {/* Stats row */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalDogs}
          </div>
          <div className="text-xs text-neutral-500">Dogs</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
            {totalPuppies}
          </div>
          <div className="text-xs text-neutral-500">Puppies</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {activeLitters.length}
          </div>
          <div className="text-xs text-neutral-500">
            Active litter{activeLitters.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Active litters with growth chart */}
      {litterData.length > 0 ? (
        <DashboardLitters litters={litterData} />
      ) : (
        <section className="mb-5">
          <Link
            href="/litters/new"
            className="block rounded-xl border-2 border-dashed border-neutral-300 bg-white p-5 text-center text-sm text-neutral-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-blue-500"
          >
            + Record a new litter
          </Link>
        </section>
      )}

      {/* Quick action */}
      <Link
        href="/weigh-in"
        className="mb-5 block rounded-xl border border-neutral-200 bg-white p-3 text-center text-sm font-medium shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
      >
        ⚖️ Start weigh-in round
      </Link>
    </div>
  );
}
