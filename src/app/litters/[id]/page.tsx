import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";
import GrowthChart from "./GrowthChart";
import AssignBuyer from "./AssignBuyer";
import DeleteWelfareCheckButton from "./welfare/DeleteWelfareCheckButton";
import CollarColourPicker from "./CollarColourPicker";

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function dayOfLitter(whelpDate: Date): number {
  const ms = Date.now() - whelpDate.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function formatWeight(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
  return `${grams} g`;
}

export default async function LitterDetailPage({
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
      mating: {
        include: {
          dam: { select: { id: true, callName: true } },
          sire: { select: { id: true, callName: true } },
        },
      },
      welfareChecks: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
      },
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
          buyer: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!litter) notFound();

  // Load buyers for the assign dropdown.
  const buyers = await prisma.buyer.findMany({
    where: { breederId: breeder.id, deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const dam = litter.mating?.dam;
  const sire = litter.mating?.sire;
  const day = dayOfLitter(litter.whelpDate);

  return (
    <div className="mx-auto max-w-md p-4">
      <header className="mb-4 px-1">
        <Link
          href="/"
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ← Home
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-lg font-medium">
            {litter.name ?? "Litter"}
          </h1>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              Day {day}
            </span>
            <Link
              href={`/litters/${litter.id}/edit`}
              className="text-xs font-medium text-blue-600 dark:text-blue-400"
            >
              Edit
            </Link>
          </div>
        </div>
      </header>

      {/* Litter summary */}
      <section className="mb-5 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <dl className="divide-y divide-neutral-200 dark:divide-neutral-800">
          <div className="flex justify-between px-4 py-2.5">
            <dt className="text-sm text-neutral-500">Whelp date</dt>
            <dd className="text-sm font-medium">{formatDate(litter.whelpDate)}</dd>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <dt className="text-sm text-neutral-500">Status</dt>
            <dd className="text-sm font-medium capitalize">
              {litter.status.replace("_", " ")}
            </dd>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <dt className="text-sm text-neutral-500">Total born</dt>
            <dd className="text-sm font-medium">{litter.totalBorn ?? "—"}</dd>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <dt className="text-sm text-neutral-500">Born alive</dt>
            <dd className="text-sm font-medium">{litter.bornAlive ?? "—"}</dd>
          </div>
          {dam && (
            <Link
              href={`/dogs/${dam.id}`}
              className="flex justify-between px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <span className="text-sm text-neutral-500">Dam</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {dam.callName ?? "Unknown"}
              </span>
            </Link>
          )}
          {sire && (
            <Link
              href={`/dogs/${sire.id}`}
              className="flex justify-between px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <span className="text-sm text-neutral-500">Sire</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {sire.callName ?? "Unknown"}
              </span>
            </Link>
          )}
        </dl>
      </section>

      {/* Inbreeding Coefficient */}
      {litter.mating?.coiPercent != null && (
        <section className="mb-5">
          {(() => {
            const coi = litter.mating!.coiPercent!;
            const avg = litter.mating!.breedAvgCoi;
            let colour = "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
            let label = "Below average";
            if (avg != null) {
              if (coi > avg) {
                colour = "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
                label = "Above average";
              } else if (coi > avg * 0.8) {
                colour = "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
                label = "Near average";
              }
            } else {
              colour = "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
              label = "No breed average set";
            }
            return (
              <div className={`rounded-xl p-3 ${colour}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                      Inbreeding Coefficient
                    </p>
                    <p className="mt-0.5 text-lg font-bold">{coi.toFixed(2)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{label}</p>
                    {avg != null && (
                      <p className="text-xs opacity-70">
                        Breed avg: {avg.toFixed(2)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {litter.notes && (
        <p className="mb-5 rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          {litter.notes}
        </p>
      )}

      {/* Weigh-in shortcut */}
      <Link
        href="/weigh-in"
        className="mb-5 block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white"
      >
        Start weigh-in round
      </Link>

      {/* Welfare checks */}
      <section className="mb-5">
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs text-neutral-400">
            Welfare checks · {litter.welfareChecks.length}
          </p>
          <Link
            href={`/litters/${litter.id}/welfare/new`}
            className="text-xs font-medium text-blue-600 dark:text-blue-400"
          >
            + Add check
          </Link>
        </div>
        {litter.welfareChecks.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-4 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
            No welfare checks recorded yet.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
            {litter.welfareChecks.map((check) => (
              <li key={check.id} className="px-4 py-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatDate(check.date)}
                      </span>
                      {check.concerns && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          Concern
                        </span>
                      )}
                    </div>
                    {check.notes && (
                      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                        {check.notes}
                      </p>
                    )}
                    {check.damCondition && (
                      <p className="mt-0.5 text-xs text-neutral-500">
                        Dam: {check.damCondition}
                      </p>
                    )}
                    {check.concerns && (
                      <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                        Concerns: {check.concerns}
                      </p>
                    )}
                    {check.actionTaken && (
                      <p className="mt-0.5 text-xs text-neutral-500">
                        Action: {check.actionTaken}
                      </p>
                    )}
                  </div>
                  <DeleteWelfareCheckButton
                    checkId={check.id}
                    litterId={litter.id}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Growth chart */}
      {litter.puppies.length > 0 && (
        <section className="mb-5">
          <p className="mb-2 px-1 text-xs text-neutral-400">Growth chart</p>
          <GrowthChart
            whelpDate={litter.whelpDate.toISOString()}
            puppies={litter.puppies.map((p) => ({
              collarColour: p.collarColour,
              callName: p.dog.callName,
              weights: p.dog.weightLogs.map((w) => ({
                date: w.date.toISOString(),
                weightG: w.weightG,
              })),
            }))}
          />
        </section>
      )}

      {/* Puppies */}
      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs text-neutral-400">
            Puppies · {litter.puppies.length}
          </p>
          <Link
            href={`/litters/${litter.id}/add-puppy`}
            className="text-xs font-medium text-blue-600 dark:text-blue-400"
          >
            + Add puppy
          </Link>
        </div>
        {litter.puppies.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-4 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
            No puppies recorded yet.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
            {litter.puppies.map((puppy) => {
              const latestWeight = puppy.dog.weightLogs.at(-1);
              return (
                <li key={puppy.id} className="p-3">
                  <Link
                    href={`/dogs/${puppy.dogId}`}
                    className="flex items-center gap-3 hover:opacity-80"
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{
                        backgroundColor:
                          puppy.collarColour?.toLowerCase() ?? "#888",
                      }}
                    >
                      {puppy.birthOrder ?? "?"}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {puppy.collarColour ?? "Pup"}{" "}
                        <span className="font-normal text-neutral-500">
                          · {puppy.sex === "bitch" ? "F" : "M"}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500">
                        {latestWeight
                          ? `Latest: ${formatWeight(latestWeight.weightG)}`
                          : "No weights yet"}
                        {puppy.birthWeightG
                          ? ` · Birth: ${formatWeight(puppy.birthWeightG)}`
                          : ""}
                      </div>
                    </div>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs capitalize text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      {puppy.status}
                    </span>
                  </Link>
                  <div className="mt-1.5 space-y-1 pl-12">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>Collar:</span>
                      <span className="font-medium">
                        {puppy.collarColour ?? "None"}
                      </span>
                      <CollarColourPicker
                        puppyId={puppy.id}
                        currentColour={puppy.collarColour}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>Buyer:</span>
                      <AssignBuyer
                        puppyId={puppy.id}
                        currentBuyerId={puppy.buyerId}
                        buyers={buyers}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
