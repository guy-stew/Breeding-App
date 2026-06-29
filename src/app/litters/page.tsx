import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";

const DAY = 1000 * 60 * 60 * 24;

function daysBetween(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / DAY);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const LITTER_BADGE: Record<string, { label: string; cls: string }> = {
  expecting: { label: "Expecting", cls: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300" },
  whelped: { label: "Whelped", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  weaning: { label: "Weaning", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  ready: { label: "Ready", cls: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300" },
};

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-black/[0.03] p-4 dark:bg-white/[0.04]">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="mt-1 text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

export default async function LittersPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const litters = await prisma.litter.findMany({
    where: { breederId: breeder.id, deletedAt: null },
    orderBy: { whelpDate: "desc" },
    include: {
      mating: {
        select: {
          dam: { select: { callName: true, breed: true } },
          sire: { select: { callName: true } },
        },
      },
      puppies: { where: { deletedAt: null }, select: { status: true } },
    },
  });

  const now = new Date();
  const activeCount = litters.filter((l) => daysBetween(l.whelpDate, now) < 56).length;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Litters</h1>
          <p className="text-sm text-neutral-500">Every litter you&apos;ve recorded, newest first.</p>
        </div>
        <Link
          href="/litters/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Record a new litter
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <StatTile label="Litters" value={litters.length} />
        <StatTile label="Active (under 8 wks)" value={activeCount} />
        <StatTile label="Past" value={litters.length - activeCount} />
      </div>

      {litters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">No litters recorded yet.</p>
          <Link href="/litters/new" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            Record a new litter →
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {litters.map((l) => {
            const dam = l.mating?.dam;
            const sire = l.mating?.sire;
            const title =
              dam?.callName && sire?.callName
                ? `${dam.callName} × ${sire.callName}`
                : l.name || "Litter";
            const breed = dam?.breed ?? "";
            const ageWeeks = Math.floor(daysBetween(l.whelpDate, now) / 7);
            const badge = LITTER_BADGE[l.status] ?? LITTER_BADGE.whelped;
            const available = l.puppies.filter((p) => p.status === "available").length;
            const pupCount = l.puppies.length;
            return (
              <Link
                key={l.id}
                href={`/litters/${l.id}`}
                className="block rounded-xl border border-neutral-200 bg-white p-4 transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold">
                      {title}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </p>
                    <p className="text-sm text-neutral-500">
                      {breed ? `${breed} · ` : ""}whelped {formatDate(l.whelpDate)} · {ageWeeks} wks old
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-500">
                    <span>
                      {pupCount} {pupCount === 1 ? "puppy" : "puppies"}
                      {available > 0 ? ` · ${available} available` : ""}
                    </span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">View →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
