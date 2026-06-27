// ============================================================
//  src/app/weigh-in/page.tsx — the weigh-in round screen.
//
//  A server component (runs on the server, arrives pre-filled).
//  Its job: find the active litter, load its puppies in birth
//  order, and for each one find its most recent weight to show
//  as a reference. Then it hands each puppy to a WeighInRow,
//  which is the interactive bit you actually type into.
//
//  This is the "workbench in the whelping room": built for doing
//  the job fast, pup by pup, in order.
// ============================================================

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import WeighInRow from "./WeighInRow";

export default async function WeighInPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  // The active litter, with its puppies AND each puppy's Dog record.
  // We need the Dog record because (a) weights hang off dogId, and
  // (b) the most recent weight lives in the Dog's weightLogs.
  const litter = await prisma.litter.findFirst({
    where: {
      deletedAt: null,
      breederId: breeder?.id,
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
              // Just the latest weight per pup, for the "Last: …" line.
              weightLogs: {
                where: { deletedAt: null },
                orderBy: { date: "desc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-md p-4">
      <header className="mb-4 flex items-center justify-between px-1">
        <div>
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            ← Home
          </Link>
          <h1 className="text-lg font-medium">Weigh-in round</h1>
        </div>
      </header>

      {!litter && (
        <p className="mt-8 text-center text-sm text-neutral-400">
          No active litter to weigh. A litter appears here once it's whelped.
        </p>
      )}

      {litter && litter.puppies.length === 0 && (
        <p className="mt-8 text-center text-sm text-neutral-400">
          {litter.name ?? "This litter"} has no puppies recorded yet.
        </p>
      )}

      {litter && litter.puppies.length > 0 && (
        <section>
          <p className="mb-2 px-1 text-xs text-neutral-400">
            {litter.name ?? "Active litter"} · {litter.puppies.length} puppies
          </p>
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
            {litter.puppies.map((puppy) => {
              const latest = puppy.dog.weightLogs[0] ?? null;
              return (
                <WeighInRow
                  key={puppy.id}
                  dogId={puppy.dogId}
                  collarColour={puppy.collarColour}
                  callName={puppy.dog.callName}
                  birthOrder={puppy.birthOrder}
                  lastWeightG={latest?.weightG ?? null}
                  lastWeightDate={latest?.date ?? null}
                />
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
