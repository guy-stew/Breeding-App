import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { redirect } from "next/navigation";

const DAY = 1000 * 60 * 60 * 24;
const GATE_DAYS = 56; // 8-week sale gate

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / DAY);
}

function weeksAgo(date: Date): number {
  return Math.floor(daysBetween(date, new Date()) / 7);
}

// Map litter status → badge label + colour.
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

function AttentionCard({
  tone,
  icon,
  title,
  subtitle,
  href,
}: {
  tone: "amber" | "blue" | "neutral";
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href?: string;
}) {
  const tones = {
    amber:
      "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
    blue: "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200",
    neutral:
      "border-neutral-200 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100",
  };
  const inner = (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-tight">{title}</p>
        <p className="text-sm opacity-80">{subtitle}</p>
      </div>
      {href && (
        <svg className="h-5 w-5 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      )}
    </div>
  );
  return href ? (
    <Link href={href} className="block transition hover:opacity-90">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export default async function HomePage() {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [activeDogs, litters, waitlist, upcomingHealth] = await Promise.all([
    prisma.dog.count({
      where: { deletedAt: null, breederId: breeder.id, puppyRecord: null, status: "active" },
    }),
    prisma.litter.findMany({
      where: { deletedAt: null, breederId: breeder.id, status: { not: "all_homed" } },
      orderBy: { whelpDate: "desc" },
      include: {
        mating: { include: { dam: true, sire: true } },
        puppies: { where: { deletedAt: null } },
        welfareChecks: { where: { deletedAt: null }, orderBy: { date: "desc" } },
      },
    }),
    prisma.buyer.count({
      where: { deletedAt: null, breederId: breeder.id, status: "waitlist" },
    }),
    prisma.healthRecord.findFirst({
      where: {
        deletedAt: null,
        nextDueDate: { gte: startOfToday },
        dog: { breederId: breeder.id, deletedAt: null },
      },
      orderBy: { nextDueDate: "asc" },
      include: { dog: { select: { callName: true } } },
    }),
  ]);

  // Derived stats.
  const puppiesReady = litters
    .filter((l) => daysBetween(l.whelpDate, now) >= GATE_DAYS)
    .reduce((n, l) => n + l.puppies.filter((p) => p.status === "available").length, 0);

  // Needs attention.
  const attention: React.ReactNode[] = [];

  if (breeder.isLicensed && breeder.licenceExpiry) {
    const days = daysBetween(now, breeder.licenceExpiry);
    if (days <= 60) {
      attention.push(
        <AttentionCard
          key="licence"
          tone="amber"
          title={`Licence renewal due in ${days} day${days === 1 ? "" : "s"}`}
          subtitle={`Start the renewal with ${breeder.licenceAuthority ?? "your local authority"}`}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.06 9.06 0 00-1.5.124V6.375A2.625 2.625 0 018.625 3.75h6.75A2.625 2.625 0 0118 6.375v8.25m-9-3h4.5m-4.5 3h4.5m3 4.5l1.5-1.5 1.5 1.5V15a1.5 1.5 0 00-1.5-1.5h0a1.5 1.5 0 00-1.5 1.5v6.75z" />
            </svg>
          }
        />,
      );
    }
  }

  if (upcomingHealth?.nextDueDate) {
    const days = daysBetween(now, upcomingHealth.nextDueDate);
    if (days <= 14) {
      const when = days <= 0 ? "due now" : `scheduled for ${days} day${days === 1 ? "" : "s"}' time`;
      attention.push(
        <AttentionCard
          key="health"
          tone="blue"
          title={`${upcomingHealth.type.replace(/_/g, " ")} due${upcomingHealth.dog.callName ? ` — ${upcomingHealth.dog.callName}` : ""}`}
          subtitle={when.charAt(0).toUpperCase() + when.slice(1)}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          }
        />,
      );
    }
  }

  const littersNeedingWelfare = litters.filter(
    (l) => !l.welfareChecks.some((w) => w.date >= startOfToday),
  );
  if (littersNeedingWelfare.length > 0) {
    attention.push(
      <AttentionCard
        key="welfare"
        tone="neutral"
        title="Welfare check not logged today"
        subtitle={`In-person check required for ${littersNeedingWelfare.length === 1 ? "1 litter" : `${littersNeedingWelfare.length} litters`}`}
        href={`/litters/${littersNeedingWelfare[0].id}`}
        icon={
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
        }
      />,
    );
  }

  const licenceLine = breeder.licenceNumber
    ? `Licence ${breeder.licenceNumber}${breeder.licenceExpiry ? ` · expires in ${Math.max(0, daysBetween(now, breeder.licenceExpiry))} days` : ""}`
    : "Licence not on record";

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* Kennel header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.5 11a2 2 0 100-4 2 2 0 000 4zm13 0a2 2 0 100-4 2 2 0 000 4zM9 7.5a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 100-4 2 2 0 000 4zm-3 2.5c-2.4 0-4.5 2.2-4.9 4.2-.3 1.6 1 2.8 2.6 2.8.9 0 1.6-.4 2.3-.4s1.4.4 2.3.4c1.6 0 2.9-1.2 2.6-2.8C16.5 12.2 14.4 10 12 10z" />
            </svg>
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {breeder.kennelName || "My kennel"}
            </h1>
            <p className="text-sm text-neutral-500">{licenceLine}</p>
          </div>
        </div>
        {breeder.isLicensed && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 dark:bg-green-500/15 dark:text-green-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Licensed
          </span>
        )}
      </div>

      {/* Stat tiles */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Active dogs" value={activeDogs} />
        <StatTile label="Live litters" value={litters.length} />
        <StatTile label="Puppies ready" value={puppiesReady} />
        <StatTile label="Waitlist" value={waitlist} />
      </div>

      {/* Needs attention */}
      {attention.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Needs attention
          </h2>
          <div className="space-y-2.5">{attention}</div>
        </section>
      )}

      {/* Active litters */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Active litters
        </h2>
        {litters.length === 0 ? (
          <Link
            href="/litters/new"
            className="block rounded-xl border-2 border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-900"
          >
            + Record a new litter
          </Link>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {litters.map((l) => {
              const badge = LITTER_BADGE[l.status] ?? LITTER_BADGE.whelped;
              const ageDays = daysBetween(l.whelpDate, now);
              const progress = Math.min(1, ageDays / GATE_DAYS);
              const reserved = l.puppies.filter((p) => ["reserved", "sold"].includes(p.status)).length;
              const available = l.puppies.filter((p) => p.status === "available").length;
              const weeksToGate = Math.max(0, Math.ceil((GATE_DAYS - ageDays) / 7));
              const title =
                l.mating?.dam?.callName && l.mating?.sire?.callName
                  ? `${l.mating.dam.callName} × ${l.mating.sire.callName}`
                  : l.name || "Litter";
              const breed = l.mating?.dam?.breed ?? "";
              const ready = weeksToGate === 0;

              return (
                <Link
                  key={l.id}
                  href={`/litters/${l.id}`}
                  className="rounded-xl border border-neutral-200 bg-white p-4 transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h3 className="truncate text-lg font-semibold">{title}</h3>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {breed ? `${breed} · ` : ""}whelped {weeksAgo(l.whelpDate)} weeks ago
                  </p>
                  <div className="my-3 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className={`h-full rounded-full ${ready ? "bg-green-500" : "bg-blue-500"}`}
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      🐾 {l.puppies.length} pups · {reserved ? `${reserved} reserved` : `${available} available`}
                    </span>
                    <span className={ready ? "font-medium text-green-600 dark:text-green-400" : "text-neutral-500"}>
                      {ready ? "Clear to home" : `Ready in ${weeksToGate} wks`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
