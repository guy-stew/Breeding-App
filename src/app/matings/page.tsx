import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";

function formatDate(date: Date | null) {
  if (!date) return "Date TBC";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const METHOD_LABEL: Record<string, string> = {
  natural: "Natural",
  ai_fresh: "AI · fresh",
  ai_chilled: "AI · chilled",
  ai_frozen: "AI · frozen",
};

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-black/[0.03] p-4 dark:bg-white/[0.04]">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="mt-1 text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function coiStyle(coi: number, avg: number | null): { cls: string; label: string } {
  if (avg == null) return { cls: "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300", label: "no avg" };
  if (coi > avg) return { cls: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300", label: "above avg" };
  if (coi > avg * 0.8) return { cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300", label: "near avg" };
  return { cls: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300", label: "below avg" };
}

export default async function MatingsPage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const matings = await prisma.mating.findMany({
    where: { deletedAt: null, dam: { breederId: breeder.id } },
    orderBy: { matingDate: "desc" },
    include: {
      dam: { select: { callName: true, breed: true } },
      sire: { select: { callName: true, ownership: true } },
      litter: { select: { id: true, name: true } },
    },
  });

  const withLitter = matings.filter((m) => m.litter).length;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Matings</h1>
          <p className="text-sm text-neutral-500">Every pairing, its COI, and the litter it produced.</p>
        </div>
        <Link
          href="/litters/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Record mating
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <StatTile label="Matings" value={matings.length} />
        <StatTile label="Produced a litter" value={withLitter} />
        <StatTile label="Awaiting litter" value={matings.length - withLitter} />
      </div>

      {matings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">No matings recorded yet.</p>
          <Link href="/litters/new" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
            Record a mating + litter →
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {matings.map((m) => {
            const title = `${m.dam.callName ?? "Dam"} × ${m.sire.callName ?? "Sire"}`;
            const external = m.sire.ownership === "external";
            const coi = coiStyle(m.coiPercent ?? 0, m.breedAvgCoi);
            const cardClass =
              "block rounded-xl border border-neutral-200 bg-white p-4 transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900";
            const inner = (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {title}
                    {external && <span className="ml-2 rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">external sire</span>}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {m.dam.breed} · {METHOD_LABEL[m.method] ?? m.method} · {formatDate(m.matingDate)}
                    {m.predictedWhelpDate ? ` · whelp due ${formatDate(m.predictedWhelpDate)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {m.coiPercent != null && (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${coi.cls}`}>
                      COI {m.coiPercent.toFixed(1)}% · {coi.label}
                    </span>
                  )}
                  {m.litter ? (
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">View litter →</span>
                  ) : (
                    <span className="text-sm text-neutral-400">No litter yet</span>
                  )}
                </div>
              </div>
            );
            return m.litter ? (
              <Link key={m.id} href={`/litters/${m.litter.id}`} className={cardClass}>
                {inner}
              </Link>
            ) : (
              <div key={m.id} className={cardClass}>
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
