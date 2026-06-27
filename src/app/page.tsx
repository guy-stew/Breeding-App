// ============================================================
//  src/app/page.tsx — the home screen.
//
//  This is a "server component": the code here runs on the
//  server, BEFORE the page is sent to the browser. That means
//  we can ask the database for data right here, and the page
//  arrives already filled in. No loading spinners, no extra
//  round-trips.
//
//  What it shows (matching the mockup):
//   - the active litter as a card at the top, if there is one
//   - the breeder's dogs as a list below
// ============================================================

import { prisma } from "@/lib/prisma";

// Small helper: turn a whelp date into "Day N" of the litter.
function dayOfLitter(whelpDate: Date): number {
  const ms = Date.now() - whelpDate.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export default async function HomePage() {
  // ----------------------------------------------------------
  // Fetch the breeder, their dogs, and any active litter.
  // We grab the first breeder for now — once login is added,
  // this becomes "the logged-in breeder".
  // ----------------------------------------------------------
  const breeder = await prisma.breeder.findFirst({
    where: { deletedAt: null },
  });

  // The adult dogs (not the puppies — puppies have a litter link).
  const dogs = await prisma.dog.findMany({
    where: {
      deletedAt: null,
      breederId: breeder?.id,
      puppyRecord: null, // exclude dogs that are puppies in a litter
    },
    orderBy: { callName: "asc" },
  });

  // The most recent litter that isn't fully homed yet.
  const activeLitter = await prisma.litter.findFirst({
    where: {
      deletedAt: null,
      breederId: breeder?.id,
      status: { not: "all_homed" },
    },
    orderBy: { whelpDate: "desc" },
    include: { puppies: { where: { deletedAt: null } } },
  });

  return (
    <main className="mx-auto max-w-md p-4">
      {/* Kennel header */}
      <header className="mb-4 flex items-center justify-between px-1">
        <h1 className="text-lg font-medium">
          {breeder?.kennelName ?? "My kennel"}
        </h1>
      </header>

      {/* Active litter card */}
      {activeLitter && (
        <section className="mb-5">
          <p className="mb-1 px-1 text-xs text-neutral-400">Happening now</p>
          <div className="rounded-xl border border-blue-500/40 bg-white p-4 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-medium">{activeLitter.name}</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                Day {dayOfLitter(activeLitter.whelpDate)}
              </span>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                <div className="text-xs text-neutral-400">Puppies</div>
                <div className="text-xl font-medium">
                  {activeLitter.puppies.length}
                </div>
              </div>
              <div className="flex-1 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                <div className="text-xs text-neutral-400">Born alive</div>
                <div className="text-xl font-medium">
                  {activeLitter.bornAlive ?? "—"}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dogs list */}
      <section>
        <p className="mb-2 px-1 text-xs text-neutral-400">My dogs</p>
        <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {dogs.map((dog) => (
            <li key={dog.id} className="flex items-center gap-3 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                {(dog.callName ?? "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{dog.callName}</div>
                <div className="text-xs text-neutral-500">
                  {dog.breed} · {dog.sex === "bitch" ? "bitch" : "dog"}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {dogs.length === 0 && (
          <p className="mt-4 text-center text-sm text-neutral-400">
            No dogs yet. Run the seed script, or add your first dog.
          </p>
        )}
      </section>
    </main>
  );
}
