import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import SignOutButton from "./SignOutButton";

function dayOfLitter(whelpDate: Date): number {
  const ms = Date.now() - whelpDate.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export default async function HomePage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const dogs = await prisma.dog.findMany({
    where: {
      deletedAt: null,
      breederId: breeder.id,
      puppyRecord: null,
    },
    orderBy: { callName: "asc" },
  });

  const activeLitter = await prisma.litter.findFirst({
    where: {
      deletedAt: null,
      breederId: breeder.id,
      status: { not: "all_homed" },
    },
    orderBy: { whelpDate: "desc" },
    include: { puppies: { where: { deletedAt: null } } },
  });

  return (
    <main className="mx-auto max-w-md p-4">
      <header className="mb-4 flex items-center justify-between px-1">
        <h1 className="text-lg font-medium">
          {breeder.kennelName ?? "My kennel"}
        </h1>
        <SignOutButton />
      </header>

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

            <Link
              href="/weigh-in"
              className="mt-3 block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white"
            >
              Start weigh-in round
            </Link>
          </div>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs text-neutral-400">My dogs</p>
          <Link
            href="/dogs/new"
            className="text-xs font-medium text-blue-600 dark:text-blue-400"
          >
            + Add dog
          </Link>
        </div>
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
            No dogs yet. Run the seed script, or{" "}
            <Link href="/dogs/new" className="text-blue-600 dark:text-blue-400">
              add your first dog
            </Link>
            .
          </p>
        )}
      </section>
    </main>
  );
}
