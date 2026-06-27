import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import ProgesteroneChart from "./ProgesteroneChart";
import AddProgTestForm from "./AddProgTestForm";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysSince(from: Date): number {
  return Math.floor((Date.now() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function predictedWhelpDate(ovulationDate: Date): Date {
  const d = new Date(ovulationDate);
  d.setDate(d.getDate() + 63);
  return d;
}

export default async function HeatCycleDetailPage({
  params,
}: {
  params: Promise<{ id: string; cycleId: string }>;
}) {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const { id, cycleId } = await params;

  const dog = await prisma.dog.findFirst({
    where: { id, breederId: breeder.id, deletedAt: null },
    select: { id: true, callName: true },
  });
  if (!dog) notFound();

  const cycle = await prisma.heatCycle.findFirst({
    where: { id: cycleId, dogId: id, deletedAt: null },
    include: {
      progesteroneTests: {
        where: { deletedAt: null },
        orderBy: { date: "asc" },
      },
    },
  });
  if (!cycle) notFound();

  // Find the first test at or above 5.0 ng/ml — that's ovulation.
  const ovulationTest = cycle.progesteroneTests.find(
    (t) => t.levelNgMl >= 5.0,
  );
  const whelpDate = ovulationTest
    ? predictedWhelpDate(ovulationTest.date)
    : null;

  const isOngoing = !cycle.endDate;
  const durationDays = cycle.endDate
    ? Math.floor(
        (cycle.endDate.getTime() - cycle.startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : daysSince(cycle.startDate);

  return (
    <div className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href={`/dogs/${dog.id}`}
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Back to {dog.callName ?? "dog"}
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-lg font-medium">Heat cycle</h1>
          <span className={`rounded-full px-3 py-1 text-xs ${isOngoing ? "bg-pink-50 text-pink-800 dark:bg-pink-950 dark:text-pink-200" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"}`}>
            {isOngoing ? "In progress" : "Ended"}
          </span>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-5 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <dl className="divide-y divide-neutral-200 dark:divide-neutral-800">
          <div className="flex justify-between px-4 py-2.5">
            <dt className="text-sm text-neutral-500">Started</dt>
            <dd className="text-sm font-medium">{formatDate(cycle.startDate)}</dd>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <dt className="text-sm text-neutral-500">Ended</dt>
            <dd className="text-sm font-medium">
              {cycle.endDate ? formatDate(cycle.endDate) : "Ongoing"}
            </dd>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <dt className="text-sm text-neutral-500">Duration</dt>
            <dd className="text-sm font-medium">
              {durationDays} day{durationDays !== 1 ? "s" : ""}
              {isOngoing ? " so far" : ""}
            </dd>
          </div>
          {ovulationTest && (
            <div className="flex justify-between px-4 py-2.5">
              <dt className="text-sm text-neutral-500">Est. ovulation</dt>
              <dd className="text-sm font-medium">
                {formatDate(ovulationTest.date)}
              </dd>
            </div>
          )}
          {whelpDate && (
            <div className="flex justify-between px-4 py-2.5 bg-pink-50/50 dark:bg-pink-950/30">
              <dt className="text-sm font-medium text-pink-700 dark:text-pink-300">
                Predicted whelp date
              </dt>
              <dd className="text-sm font-bold text-pink-700 dark:text-pink-300">
                {formatDate(whelpDate)}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {cycle.notes && (
        <p className="mb-5 rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          {cycle.notes}
        </p>
      )}

      {/* Progesterone chart */}
      {cycle.progesteroneTests.length > 0 && (
        <section className="mb-5">
          <p className="mb-2 px-1 text-xs text-neutral-400">
            Progesterone levels
          </p>
          <ProgesteroneChart
            tests={cycle.progesteroneTests.map((t) => ({
              date: t.date.toISOString(),
              levelNgMl: t.levelNgMl,
            }))}
          />
        </section>
      )}

      {/* Progesterone test log */}
      <section className="mb-5">
        <p className="mb-2 px-1 text-xs text-neutral-400">
          Progesterone tests · {cycle.progesteroneTests.length}
        </p>
        {cycle.progesteroneTests.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-4 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
            No tests recorded yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs text-neutral-400 dark:border-neutral-800">
                  <th className="px-4 py-2 font-normal">Date</th>
                  <th className="px-4 py-2 text-right font-normal">
                    Level (ng/ml)
                  </th>
                  <th className="px-4 py-2 text-right font-normal">Reading</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {cycle.progesteroneTests.map((test) => {
                  let badge = "Baseline";
                  let badgeClass =
                    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
                  if (test.levelNgMl >= 5.0) {
                    badge = "Ovulation";
                    badgeClass =
                      "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300";
                  } else if (test.levelNgMl >= 2.0) {
                    badge = "LH surge";
                    badgeClass =
                      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
                  }
                  return (
                    <tr key={test.id}>
                      <td className="px-4 py-2">{formatDate(test.date)}</td>
                      <td className="px-4 py-2 text-right font-medium">
                        {test.levelNgMl.toFixed(1)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${badgeClass}`}
                        >
                          {badge}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add test form */}
      <section>
        <p className="mb-2 px-1 text-xs text-neutral-400">
          Add progesterone test
        </p>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <AddProgTestForm cycleId={cycle.id} dogId={dog.id} />
        </div>
      </section>
    </div>
  );
}
