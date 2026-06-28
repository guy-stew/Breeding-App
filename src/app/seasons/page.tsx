import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { avatarColour, initial } from "../avatar";

const DAY = 1000 * 60 * 60 * 24;

function daysSince(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / DAY);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-black/[0.03] p-4 dark:bg-white/[0.04]">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="mt-1 text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

export default async function SeasonsPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const [cycles, bitches] = await Promise.all([
    prisma.heatCycle.findMany({
      where: { deletedAt: null, dog: { breederId: breeder.id, deletedAt: null } },
      orderBy: { startDate: "desc" },
      include: {
        dog: { select: { id: true, callName: true, breed: true } },
        progesteroneTests: { where: { deletedAt: null }, orderBy: { date: "asc" } },
      },
    }),
    prisma.dog.count({
      where: { deletedAt: null, breederId: breeder.id, sex: "bitch", puppyRecord: null, status: "active" },
    }),
  ]);

  const inSeason = cycles.filter((c) => !c.endDate);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Seasons</h1>
        <p className="text-sm text-neutral-500">Heat cycles and progesterone timing across your bitches.</p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <StatTile label="Bitches" value={bitches} />
        <StatTile label="In season now" value={inSeason.length} />
        <StatTile label="Seasons logged" value={cycles.length} />
      </div>

      {/* In season now */}
      {inSeason.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">In season now</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {inSeason.map((c) => {
              const name = c.dog.callName ?? "Unknown";
              const latest = c.progesteroneTests.at(-1);
              return (
                <Link
                  key={c.id}
                  href={`/dogs/${c.dog.id}/heat-cycles/${c.id}`}
                  className="flex items-center gap-3 rounded-xl border border-pink-300 bg-pink-50 p-4 transition hover:shadow-md dark:border-pink-500/30 dark:bg-pink-500/10"
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold ${avatarColour(name)}`}>
                    {initial(name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-pink-700/80 dark:text-pink-300/80">
                      Day {daysSince(c.startDate)} · {latest ? `${latest.levelNgMl} ng/ml` : "no tests yet"}
                    </p>
                  </div>
                  <span className="rounded-full bg-pink-200 px-2.5 py-0.5 text-xs font-medium text-pink-800 dark:bg-pink-500/20 dark:text-pink-200">
                    Active
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* All seasons */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">All seasons</h2>
        {cycles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500">No seasons recorded yet.</p>
            <Link href="/dogs" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
              Open a bitch&apos;s profile to record one →
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            {cycles.map((c) => {
              const name = c.dog.callName ?? "Unknown";
              const length = c.endDate ? Math.floor((c.endDate.getTime() - c.startDate.getTime()) / DAY) : null;
              return (
                <Link
                  key={c.id}
                  href={`/dogs/${c.dog.id}/heat-cycles/${c.id}`}
                  className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 transition last:border-0 hover:bg-neutral-50 dark:border-neutral-800/60 dark:hover:bg-neutral-800/40"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarColour(name)}`}>
                    {initial(name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{name} <span className="font-normal text-neutral-500">· {c.dog.breed}</span></p>
                    <p className="text-sm text-neutral-500">
                      Started {formatDate(c.startDate)}
                      {c.progesteroneTests.length > 0 ? ` · ${c.progesteroneTests.length} test${c.progesteroneTests.length === 1 ? "" : "s"}` : ""}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.endDate ? "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300" : "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300"}`}>
                    {c.endDate ? `${length} days` : "Active"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
