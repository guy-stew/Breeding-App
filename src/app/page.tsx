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

  // Stats
  const totalDogs = dogs.length;
  const totalPuppies = activeLitter?.puppies.length ?? 0;

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
            {activeLitter ? 1 : 0}
          </div>
          <div className="text-xs text-neutral-500">Active litter</div>
        </div>
      </div>

      {/* Active litter card */}
      {activeLitter && (
        <section className="mb-5">
          <p className="mb-1 flex items-center justify-between px-1">
            <span className="text-xs font-medium text-neutral-400">
              Active litter
            </span>
            <Link
              href="/litters/new"
              className="text-xs font-medium text-blue-600 dark:text-blue-400"
            >
              + New litter
            </Link>
          </p>
          <div className="rounded-xl border border-blue-500/30 bg-white p-4 shadow-sm dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <Link
                href={`/litters/${activeLitter.id}`}
                className="font-medium hover:text-blue-600"
              >
                {activeLitter.name}
              </Link>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                Day {dayOfLitter(activeLitter.whelpDate)}
              </span>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800">
                <div className="text-xs text-neutral-400">Puppies</div>
                <div className="text-xl font-bold">
                  {activeLitter.puppies.length}
                </div>
              </div>
              <div className="flex-1 rounded-lg bg-neutral-50 p-2.5 dark:bg-neutral-800">
                <div className="text-xs text-neutral-400">Born alive</div>
                <div className="text-xl font-bold">
                  {activeLitter.bornAlive ?? "—"}
                </div>
              </div>
            </div>
            <Link
              href="/weigh-in"
              className="mt-3 block rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              Start weigh-in round
            </Link>
          </div>
        </section>
      )}

      {!activeLitter && (
        <section className="mb-5">
          <Link
            href="/litters/new"
            className="block rounded-xl border-2 border-dashed border-neutral-300 bg-white p-5 text-center text-sm text-neutral-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-blue-500"
          >
            + Record a new litter
          </Link>
        </section>
      )}

      {/* Quick actions */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Link
          href="/weigh-in"
          className="rounded-xl border border-neutral-200 bg-white p-3 text-center text-sm font-medium shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="mb-1 text-lg">⚖️</div>
          Weigh-in
        </Link>
        <Link
          href="/marketplace"
          className="rounded-xl border border-neutral-200 bg-white p-3 text-center text-sm font-medium shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="mb-1 text-lg">🏪</div>
          Marketplace
        </Link>
      </div>

      {/* My dogs */}
      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs font-medium text-neutral-400">My dogs</p>
          <Link
            href="/dogs/new"
            className="text-xs font-medium text-blue-600 dark:text-blue-400"
          >
            + Add dog
          </Link>
        </div>
        {dogs.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-400">
              No dogs yet.{" "}
              <Link
                href="/dogs/new"
                className="text-blue-600 dark:text-blue-400"
              >
                Add your first dog
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
            {dogs.map((dog) => (
              <li key={dog.id}>
                <Link
                  href={`/dogs/${dog.id}`}
                  className="flex items-center gap-3 p-3 transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white shadow-sm">
                    {(dog.callName ?? "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{dog.callName}</div>
                    <div className="text-xs text-neutral-500">
                      {dog.breed} · {dog.sex === "bitch" ? "Bitch" : "Dog"}
                    </div>
                  </div>
                  <svg className="h-4 w-4 text-neutral-300 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
