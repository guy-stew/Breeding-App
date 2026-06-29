import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import PhotoUpload from "./PhotoUpload";
import DeletePhotoButton from "./DeletePhotoButton";
import GrowthChart from "../../litters/[id]/GrowthChart";
import AssignBuyer from "../../litters/[id]/AssignBuyer";

const DAY = 1000 * 60 * 60 * 24;
const GATE_DAYS = 56;

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function ageFromDob(dob: Date | null | undefined): string | null {
  if (!dob) return null;
  const totalDays = Math.floor((Date.now() - dob.getTime()) / DAY);
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  if (years > 0) return `${years}y ${months}m`;
  if (months > 0) return `${months}m`;
  return `${totalDays}d`;
}

export default async function DogProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const { id } = await params;

  const dog = await prisma.dog.findFirst({
    where: { id, breederId: breeder.id, deletedAt: null },
    include: {
      sire: { select: { id: true, callName: true } },
      dam: { select: { id: true, callName: true } },
      weightLogs: { where: { deletedAt: null }, orderBy: { date: "asc" } },
      healthRecords: { where: { deletedAt: null }, orderBy: { date: "desc" } },
      photos: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
      heatCycles: {
        where: { deletedAt: null },
        orderBy: { startDate: "desc" },
        include: { progesteroneTests: { where: { deletedAt: null }, orderBy: { date: "asc" }, take: 1 } },
      },
      puppyRecord: {
        include: {
          buyer: { select: { id: true, name: true, status: true } },
          litter: {
            select: {
              id: true,
              name: true,
              whelpDate: true,
              mating: { select: { dam: { select: { callName: true } }, sire: { select: { callName: true } } } },
              puppies: { where: { deletedAt: null }, select: { id: true } },
            },
          },
        },
      },
    },
  });

  if (!dog) notFound();

  // ============================================================
  //  PUPPY RECORD VIEW (mockup 04) — shown when this Dog is a puppy.
  // ============================================================
  if (dog.puppyRecord) {
    const pr = dog.puppyRecord;
    const litter = pr.litter;
    const now = new Date();
    const ageDays = Math.floor((now.getTime() - litter.whelpDate.getTime()) / DAY);
    const ageWeeks = Math.floor(ageDays / 7);
    const totalPups = litter.puppies.length;
    const gateDate = new Date(litter.whelpDate.getTime() + GATE_DAYS * DAY);
    const gateCleared = ageDays >= GATE_DAYS;

    const litterTitle =
      litter.mating?.dam?.callName && litter.mating?.sire?.callName
        ? `${litter.mating.dam.callName} × ${litter.mating.sire.callName}`
        : litter.name ?? "litter";

    const logs = dog.weightLogs; // ascending
    const latest = logs.at(-1);
    let deltaThisWeek: number | null = null;
    if (latest) {
      const weekAgoTs = latest.date.getTime() - 7 * DAY;
      const prior = [...logs].reverse().find((l) => l.date.getTime() <= weekAgoTs);
      if (prior) deltaThisWeek = latest.weightG - prior.weightG;
    }

    const reserved = ["reserved", "sold"].includes(pr.status);
    const sexLabel = pr.sex === "bitch" ? "Female" : "Male";

    const buyers = await prisma.buyer.findMany({
      where: { breederId: breeder.id, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    const vetCheck = dog.healthRecords.find((r) => r.type === "vet_check");

    const STATUS_BADGE: Record<string, string> = {
      available: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
      reserved: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      sold: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      kept: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
      deceased: "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300",
    };

    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <Link href={`/litters/${litter.id}`} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {litterTitle} litter
        </Link>

        {/* Header */}
        <div className="mt-3 mb-5 flex items-center gap-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ring-black/10"
            style={{ backgroundColor: pr.collarColour?.toLowerCase() ?? "#e5e7eb" }}
          >
            <span className="h-5 w-5 rounded-full bg-white/70" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight">
                {pr.collarColour ? `${pr.collarColour} collar` : dog.callName ?? "Puppy"}
              </h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[pr.status] ?? STATUS_BADGE.available}`}>
                {pr.status}
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              {sexLabel} · {dog.breed} · {ageWeeks} weeks old{pr.birthOrder ? ` · birth order ${pr.birthOrder} of ${totalPups}` : ""}
            </p>
          </div>
        </div>

        {/* Reservation banner */}
        {reserved && pr.buyer ? (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
            <svg className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-amber-900 dark:text-amber-200">Reserved by {pr.buyer.name}</p>
              <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
                {pr.buyer.status === "deposit_paid" ? "Deposit paid · " : ""}
                {gateCleared ? "clear to home now" : `can't be homed until ${formatDate(gateDate)} (8-week gate)`}
              </p>
            </div>
            <Link href={`/buyers/${pr.buyer.id}`} className="shrink-0 text-sm font-medium text-amber-800 hover:underline dark:text-amber-300">
              View buyer →
            </Link>
          </div>
        ) : (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-sm text-neutral-500">Not reserved — assign a buyer:</span>
            <AssignBuyer puppyId={pr.id} currentBuyerId={pr.buyerId} buyers={buyers} />
          </div>
        )}

        {/* Weight */}
        <section className="mb-6">
          <div className="mb-2 flex items-end justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Weight</h2>
            {latest && (
              <p className="text-sm text-neutral-500">
                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{(latest.weightG / 1000).toFixed(1)}</span> kg
                {deltaThisWeek != null && ` · ${deltaThisWeek >= 0 ? "up" : "down"} ${Math.abs(deltaThisWeek)}g this week`}
              </p>
            )}
          </div>
          {logs.length > 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
              <GrowthChart
                whelpDate={litter.whelpDate.toISOString()}
                puppies={[{
                  collarColour: pr.collarColour,
                  callName: dog.callName,
                  weights: logs.map((w) => ({ date: w.date.toISOString(), weightG: w.weightG })),
                }]}
              />
            </div>
          ) : (
            <p className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
              No weights logged yet.
            </p>
          )}
        </section>

        {/* Birth details */}
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">Birth details</h2>
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            {[
              ["Born", `${formatDate(litter.whelpDate)}${pr.birthOrder === 1 ? " · first out" : pr.birthOrder ? ` · #${pr.birthOrder}` : ""}`],
              ["Birth weight", pr.birthWeightG ? `${pr.birthWeightG} g` : "—"],
              ["Markings", pr.markings ?? dog.markings ?? "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-neutral-100 px-4 py-3 last:border-0 dark:border-neutral-800">
                <span className="text-sm text-neutral-500">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
              <span className="text-sm text-neutral-500">Palate check</span>
              <span className={`text-sm font-medium ${pr.palateCheck ? "text-green-600 dark:text-green-400" : "text-neutral-500"}`}>
                {pr.palateCheck === true ? "✓ Clear at birth" : pr.palateCheck === false ? "Not clear" : "Not recorded"}
              </span>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">Compliance before sale</h2>
          <div className="space-y-2.5">
            {/* Microchip */}
            <ComplianceRow
              done={!!pr.microchip}
              title="Microchip"
              subtitle={pr.microchip ? `Chipped · ${pr.microchip}` : "Not yet chipped · due by 8 weeks, breeder registered first"}
              actionHref={pr.microchip ? undefined : `/dogs/${dog.id}/edit`}
            />
            {/* Vet check */}
            <ComplianceRow
              done={!!vetCheck}
              title="Pre-sale vet check"
              subtitle={vetCheck ? `Done ${formatDate(vetCheck.date)}` : "Not booked · proof of health given to buyer"}
              actionHref={vetCheck ? undefined : `/dogs/${dog.id}/health/new`}
            />
            {/* Age gate */}
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${gateCleared ? "border-green-300 bg-green-50 dark:border-green-500/30 dark:bg-green-500/10" : "border-green-200 bg-green-50/60 dark:border-green-500/20 dark:bg-green-500/5"}`}>
              <svg className="h-6 w-6 shrink-0 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300">8-week age gate</p>
                <p className="text-sm text-green-700/80 dark:text-green-300/80">
                  {gateCleared ? `Cleared ${formatDate(gateDate)}` : `Clears ${formatDate(gateDate)} — sale blocked until then`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/weigh-in" className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white py-3 text-sm font-medium transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
            ⚖️ Log weight
          </Link>
          <Link href={`/dogs/${dog.id}/info-pack`} className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white py-3 text-sm font-medium transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
            📄 Puppy pack
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  //  ADULT DOG PROFILE (existing layout).
  // ============================================================
  const age = ageFromDob(dog.dateOfBirth);

  const details: [string, string][] = [
    ["Given Name", dog.callName ?? "—"],
    ["KC Registered Name", dog.registeredName ?? "—"],
    ["Breed", dog.breed],
    ["Sex", dog.sex === "bitch" ? "Bitch" : "Dog"],
    ["Colour", dog.colour ?? "—"],
    ["Markings", dog.markings ?? "—"],
    ["Date of birth", formatDate(dog.dateOfBirth)],
    ["Age", age ?? "—"],
    ["Microchip", dog.microchip ?? "—"],
    ["KC reg", dog.kcRegNumber ?? "—"],
    ["Status", dog.status],
    ["Ownership", dog.ownership.replace("_", "-")],
    ["C-sections", String(dog.caesareanCount)],
  ];

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <header className="mb-4">
        <Link href="/dogs" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Dogs
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{dog.callName ?? "Unnamed dog"}</h1>
          <Link href={`/dogs/${dog.id}/edit`} className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Edit
          </Link>
        </div>
      </header>

      {/* Photos */}
      <section className="mb-5">
        {dog.photos.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {dog.photos.map((photo) => (
              <div key={photo.id} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.caption || dog.callName || "Dog photo"} className="h-24 w-full rounded-lg object-cover" />
                <DeletePhotoButton photoId={photo.id} dogId={dog.id} />
                {photo.caption && <p className="mt-0.5 truncate text-xs text-neutral-400">{photo.caption}</p>}
              </div>
            ))}
          </div>
        )}
        <p className="mb-2 text-xs text-neutral-400">Photos · {dog.photos.length}</p>
        <PhotoUpload dogId={dog.id} />
      </section>

      {/* Details */}
      <section className="mb-5 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <dl className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between px-4 py-2.5">
              <dt className="text-sm text-neutral-500">{label}</dt>
              <dd className="text-sm font-medium capitalize">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Parents */}
      {(dog.sire || dog.dam) && (
        <section className="mb-5">
          <p className="mb-2 text-xs text-neutral-400">Parents</p>
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            {dog.dam && (
              <Link href={`/dogs/${dog.dam.id}`} className="flex justify-between px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                <span className="text-sm text-neutral-500">Dam</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{dog.dam.callName ?? "Unknown"}</span>
              </Link>
            )}
            {dog.sire && (
              <Link href={`/dogs/${dog.sire.id}`} className="flex justify-between border-t border-neutral-200 px-4 py-2.5 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800">
                <span className="text-sm text-neutral-500">Sire</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{dog.sire.callName ?? "Unknown"}</span>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Health records */}
      <section className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-neutral-400">Health records · {dog.healthRecords.length}</p>
          <Link href={`/dogs/${dog.id}/health/new`} className="text-xs font-medium text-blue-600 dark:text-blue-400">+ Add record</Link>
        </div>
        {dog.healthRecords.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-4 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">No health records yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
            {dog.healthRecords.map((rec) => (
              <li key={rec.id} className="px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{rec.type.replace(/_/g, " ")}</span>
                  <span className="text-xs text-neutral-500">{formatDate(rec.date)}</span>
                </div>
                {rec.description && <p className="text-xs text-neutral-500">{rec.description}</p>}
                {rec.result && <p className="text-xs text-neutral-500">Result: {rec.result}</p>}
                {rec.nextDueDate && <p className="text-xs text-neutral-400">Next due: {formatDate(rec.nextDueDate)}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Heat cycles (bitches only) */}
      {dog.sex === "bitch" && (
        <section className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-neutral-400">Heat cycles · {dog.heatCycles.length}</p>
            <Link href={`/dogs/${dog.id}/heat-cycles/new`} className="text-xs font-medium text-pink-600 dark:text-pink-400">+ Record cycle</Link>
          </div>
          {dog.heatCycles.length === 0 ? (
            <p className="rounded-xl border border-neutral-200 bg-white p-4 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">No heat cycles recorded yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
              {dog.heatCycles.map((cycle) => (
                <li key={cycle.id}>
                  <Link href={`/seasons/${cycle.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <div>
                      <div className="text-sm font-medium">{formatDate(cycle.startDate)}</div>
                      <div className="text-xs text-neutral-500">
                        {cycle.progesteroneTests.length > 0 ? `${cycle.progesteroneTests.length}+ test${cycle.progesteroneTests.length > 1 ? "s" : ""}` : "No tests"}
                        {cycle.endDate ? ` · ${Math.floor((cycle.endDate.getTime() - cycle.startDate.getTime()) / DAY)} days` : " · Ongoing"}
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${!cycle.endDate ? "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"}`}>
                      {!cycle.endDate ? "Active" : "Ended"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function ComplianceRow({
  done,
  title,
  subtitle,
  actionHref,
}: {
  done: boolean;
  title: string;
  subtitle: string;
  actionHref?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
      {done ? (
        <svg className="h-6 w-6 shrink-0 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="h-6 w-6 shrink-0 text-neutral-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" strokeDasharray="3 3">
          <circle cx="12" cy="12" r="9" />
        </svg>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-neutral-500">{subtitle}</p>
      </div>
      {actionHref && (
        <Link href={actionHref} className="shrink-0 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          Add →
        </Link>
      )}
    </div>
  );
}
