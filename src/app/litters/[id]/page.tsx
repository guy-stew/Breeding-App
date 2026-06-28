import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import GrowthChart from "./GrowthChart";
import DeleteWelfareCheckButton from "./welfare/DeleteWelfareCheckButton";
import CollarColourPicker from "./CollarColourPicker";

const DAY = 1000 * 60 * 60 * 24;
const GATE_DAYS = 56;

function daysBetween(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / DAY);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function ageLabel(dob: Date | null) {
  if (!dob) return "age unknown";
  const months = Math.floor(daysBetween(dob, new Date()) / 30.44);
  return months < 24 ? `${Math.max(0, months)} mo` : `${Math.floor(months / 12)} yrs`;
}

function formatKg(grams: number) {
  return `${(grams / 1000).toFixed(1)} kg`;
}

const LITTER_BADGE: Record<string, { label: string; cls: string }> = {
  expecting: { label: "Expecting", cls: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300" },
  whelped: { label: "Whelped", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  weaning: { label: "Weaning", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  ready: { label: "Ready", cls: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300" },
};

const PUPPY_BADGE: Record<string, { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300" },
  reserved: { label: "Reserved", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  sold: { label: "Sold", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  kept: { label: "Kept", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  deceased: { label: "Deceased", cls: "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300" },
};

type ParentDog = {
  id: string;
  callName: string | null;
  dateOfBirth: Date | null;
  ownership: string;
  healthRecords: { type: string; result: string | null }[];
};

function screeningSummary(dog: ParentDog) {
  const hip = dog.healthRecords.find((r) => r.type === "hip_score")?.result;
  const dnaTests = dog.healthRecords.filter((r) => r.type === "dna_test");
  const dnaClear = dnaTests.length > 0 && dnaTests.every((t) => (t.result ?? "").toLowerCase().includes("clear"));
  const parts = [ageLabel(dog.dateOfBirth)];
  if (hip) parts.push(`hip ${hip}`);
  if (dnaTests.length) parts.push(dnaClear ? "DNA clear" : "DNA noted");
  return parts.join(" · ");
}

const AVATAR_COLOURS = [
  "bg-pink-200 text-pink-800",
  "bg-blue-200 text-blue-800",
  "bg-purple-200 text-purple-800",
  "bg-green-200 text-green-800",
  "bg-amber-200 text-amber-800",
];
function avatarColour(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % AVATAR_COLOURS.length;
  return AVATAR_COLOURS[h];
}

function ParentCard({ dog, role }: { dog: ParentDog; role: "dam" | "sire" }) {
  const name = dog.callName ?? "Unknown";
  const external = dog.ownership === "external";
  return (
    <Link
      href={`/dogs/${dog.id}`}
      className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold ${avatarColour(name)}`}>
        {name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {name} <span className="font-normal text-neutral-500">· {role}{external ? " (external)" : ""}</span>
        </p>
        <p className="text-sm text-neutral-500">{screeningSummary(dog)}</p>
      </div>
      <svg className="h-5 w-5 shrink-0 text-neutral-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
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
          dam: { include: { healthRecords: { where: { deletedAt: null }, orderBy: { date: "desc" } } } },
          sire: { include: { healthRecords: { where: { deletedAt: null }, orderBy: { date: "desc" } } } },
        },
      },
      welfareChecks: { where: { deletedAt: null }, orderBy: { date: "desc" } },
      puppies: {
        where: { deletedAt: null },
        orderBy: { birthOrder: "asc" },
        include: {
          dog: { include: { weightLogs: { where: { deletedAt: null }, orderBy: { date: "asc" } } } },
          buyer: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!litter) notFound();

  const now = new Date();
  const dam = litter.mating?.dam;
  const sire = litter.mating?.sire;
  const breed = dam?.breed ?? sire?.breed ?? "";
  const ageDays = daysBetween(litter.whelpDate, now);
  const ageWeeks = Math.floor(ageDays / 7);
  const badge = LITTER_BADGE[litter.status] ?? LITTER_BADGE.whelped;

  const reserved = litter.puppies.filter((p) => ["reserved", "sold"].includes(p.status)).length;
  const available = litter.puppies.filter((p) => p.status === "available").length;
  const bornAlive = litter.bornAlive ?? litter.puppies.length;
  const weeksToGate = Math.max(0, Math.ceil((GATE_DAYS - ageDays) / 7));
  const gateDate = new Date(litter.whelpDate.getTime() + GATE_DAYS * DAY);
  const gateCleared = ageDays >= GATE_DAYS;

  const title =
    dam?.callName && sire?.callName ? `${dam.callName} × ${sire.callName}` : litter.name || "Litter";

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const loggedToday = litter.welfareChecks.some((w) => w.date >= startOfToday);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      {/* Header */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Dashboard
      </Link>

      <div className="mt-2 mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.cls}`}>{badge.label}</span>
          </div>
          <p className="mt-0.5 text-sm text-neutral-500">
            {breed ? `${breed} litter · ` : ""}whelped {formatDate(litter.whelpDate)} · {ageWeeks} weeks old
          </p>
        </div>
        <Link
          href="/listings/new"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m-9 9h18" />
          </svg>
          Publish listing
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Born alive", value: String(bornAlive) },
          { label: "Reserved", value: String(reserved) },
          { label: "Available", value: String(available) },
          { label: "Ready to home", value: gateCleared ? "Now" : `${weeksToGate} wks` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-black/[0.03] p-4 dark:bg-white/[0.04]">
            <div className="text-sm text-neutral-500">{s.label}</div>
            <div className="mt-1 text-2xl font-bold tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      {/* 8-week gate banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-300 bg-blue-50 px-4 py-3 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-semibold">8-week sale gate</p>
          <p className="text-sm opacity-90">
            {gateCleared
              ? "Puppies are clear to home now."
              : `Puppies can't be homed until ${formatDate(gateDate)}. Reservations allowed now.`}
          </p>
        </div>
      </div>

      {/* Parents */}
      {(dam || sire) && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">Parents</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {dam && <ParentCard dog={dam} role="dam" />}
            {sire && <ParentCard dog={sire} role="sire" />}
          </div>
        </section>
      )}

      {/* COI (kept from existing feature) */}
      {litter.mating?.coiPercent != null && (
        <section className="mb-6">
          {(() => {
            const coi = litter.mating!.coiPercent!;
            const avg = litter.mating!.breedAvgCoi;
            let cls = "border-green-300 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300";
            let label = "Below breed average";
            if (avg != null) {
              if (coi > avg) {
                cls = "border-red-300 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300";
                label = "Above breed average";
              } else if (coi > avg * 0.8) {
                cls = "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
                label = "Near breed average";
              }
            } else {
              cls = "border-neutral-200 bg-white text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400";
              label = "No breed average set";
            }
            return (
              <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${cls}`}>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide opacity-70">Inbreeding coefficient</p>
                  <p className="mt-0.5 text-lg font-bold">{coi.toFixed(2)}%</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{label}</p>
                  {avg != null && <p className="opacity-70">Breed avg {avg.toFixed(2)}%</p>}
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* Puppies */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Puppies</h2>
          <div className="flex items-center gap-4">
            {litter.puppies.length > 0 && (
              <a href="#growth" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" />
                </svg>
                Growth chart
              </a>
            )}
            <Link href={`/litters/${litter.id}/add-puppy`} className="text-sm font-medium text-blue-600 dark:text-blue-400">
              + Add puppy
            </Link>
          </div>
        </div>

        {litter.puppies.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
            No puppies recorded yet.
          </p>
        ) : (
          <div className="space-y-2.5">
            {litter.puppies.map((puppy) => {
              const latest = puppy.dog.weightLogs.at(-1);
              const pBadge = PUPPY_BADGE[puppy.status] ?? PUPPY_BADGE.available;
              const sexLabel = puppy.sex === "bitch" ? "female" : "male";
              return (
                <div
                  key={puppy.id}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: puppy.collarColour?.toLowerCase() ?? "#9ca3af" }}
                  />
                  <Link href={`/dogs/${puppy.dogId}`} className="min-w-0 flex-1 hover:underline">
                    <span className="font-medium">
                      {puppy.collarColour ? `${puppy.collarColour} collar` : `Pup ${puppy.birthOrder ?? ""}`}
                    </span>{" "}
                    <span className="text-neutral-500">· {sexLabel}</span>
                  </Link>
                  <CollarColourPicker puppyId={puppy.id} currentColour={puppy.collarColour} />
                  <span className="w-16 text-right text-sm text-neutral-600 dark:text-neutral-300">
                    {latest ? formatKg(latest.weightG) : "—"}
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${pBadge.cls}`}>
                    {pBadge.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Welfare checks */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Welfare checks · licence condition
        </h2>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {!loggedToday && (
            <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
              <svg className="h-5 w-5 shrink-0 text-neutral-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" strokeDasharray="3 3">
                <circle cx="12" cy="12" r="9" />
              </svg>
              <span className="flex-1 text-sm text-neutral-500">Today · not yet logged</span>
              <span className="text-sm font-medium text-neutral-400">Due</span>
            </div>
          )}
          {litter.welfareChecks.length === 0 && loggedToday ? null : litter.welfareChecks.map((check) => {
            const concern = !!check.concerns;
            return (
              <div key={check.id} className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 last:border-0 dark:border-neutral-800">
                <svg className={`h-5 w-5 shrink-0 ${concern ? "text-amber-500" : "text-green-500"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {check.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })},{" "}
                    {check.date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {check.notes && <p className="truncate text-xs text-neutral-500">{check.notes}</p>}
                </div>
                <span className={`text-sm font-medium ${concern ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}>
                  {concern ? "Concern" : "All thriving"}
                </span>
                <DeleteWelfareCheckButton checkId={check.id} litterId={litter.id} />
              </div>
            );
          })}
        </div>
        <Link
          href={`/litters/${litter.id}/welfare/new`}
          className="mt-2.5 block rounded-xl border border-neutral-300 bg-white py-3 text-center text-sm font-medium transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        >
          + Log today&apos;s welfare check
        </Link>
      </section>

      {/* Growth chart */}
      {litter.puppies.length > 0 && (
        <section id="growth" className="scroll-mt-20">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">Growth chart</h2>
          <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
            <GrowthChart
              whelpDate={litter.whelpDate.toISOString()}
              puppies={litter.puppies.map((p) => ({
                collarColour: p.collarColour,
                callName: p.dog.callName,
                weights: p.dog.weightLogs.map((w) => ({ date: w.date.toISOString(), weightG: w.weightG })),
              }))}
            />
          </div>
        </section>
      )}
    </div>
  );
}
