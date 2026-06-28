import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import {
  derivePhase, deriveConfidence, fertileWindow, predictedWhelp, daysStanding,
  estimateOvulationDay, daysBetween,
  type CycleInput, type CycleOutcome, type HeatSignKind, type Phase, type Confidence,
} from "@/lib/cycle";
import CycleTimeline, { type TimelineMarker } from "./CycleTimeline";
import SignLogger from "./SignLogger";
import AddReadingForm from "./AddReadingForm";
import SeasonProgesteroneChart from "./SeasonProgesteroneChart";
import { initial } from "../../avatar";

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const ACCENT: Record<Phase, { status: string; av: string; statusLabel: string }> = {
  early: { status: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300", av: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300", statusLabel: "In season" },
  fertile: { status: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300", av: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300", statusLabel: "Ready to mate" },
  pregnant: { status: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300", av: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300", statusLabel: "Pregnant" },
  ended: { status: "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300", av: "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300", statusLabel: "Season ended" },
};

const SIGN_LABEL: Record<string, string> = {
  discharge_start: "Discharge", swelling: "Swelling", discharge_change: "Discharge change",
  tail_flagging: "Tail flagging", standing: "Standing", refusing: "Refusing",
};
const SIGN_COLOR: Record<string, string> = {
  standing: "#16a34a", tail_flagging: "#f59e0b", refusing: "#9ca3af",
};
const PINK = "#F4C0D1", ESTRUS = "#9FE1CB", DIESTRUS = "#B5D4F4", GREEN = "#16a34a";

function MetricCard({ label, value, hint, tint, valueColor }: { label: string; value: React.ReactNode; hint?: string; tint?: string; valueColor?: string }) {
  return (
    <div className={`rounded-xl border p-4 ${tint ?? "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"}`}>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`mt-1.5 text-lg font-bold leading-tight ${valueColor ?? ""}`}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-neutral-400">{hint}</p>}
    </div>
  );
}

function ConfidenceDots({ level }: { level: Confidence }) {
  const filled = level === "high" ? 3 : level === "medium" ? 2 : 1;
  const colour = level === "high" ? "#16a34a" : level === "medium" ? "#2563eb" : "#f59e0b";
  return (
    <span className="ml-2 inline-flex gap-1 align-middle">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1 w-3 rounded-full" style={{ background: i < filled ? colour : "#d4d4d4" }} />
      ))}
    </span>
  );
}

export default async function SeasonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const breeder = await getBreeder();
  if (!breeder) redirect("/login");

  const { id } = await params;

  const cycle = await prisma.heatCycle.findFirst({
    where: { id, deletedAt: null, dog: { breederId: breeder.id } },
    include: {
      dog: { select: { id: true, callName: true, breed: true } },
      progesteroneTests: { where: { deletedAt: null }, orderBy: { date: "asc" } },
      signs: { where: { deletedAt: null }, orderBy: { date: "asc" } },
      matings: { where: { deletedAt: null }, include: { sire: { select: { callName: true, ownership: true } } } },
    },
  });
  if (!cycle) notFound();

  const seasonNo = await prisma.heatCycle.count({
    where: { dogId: cycle.dogId, deletedAt: null, startDate: { lte: cycle.startDate } },
  });

  const today = new Date();
  const input: CycleInput = {
    startDate: cycle.startDate,
    endDate: cycle.endDate,
    outcome: cycle.outcome as CycleOutcome,
    signs: cycle.signs.map((s) => ({ type: s.type as HeatSignKind, date: s.date })),
    progesterone: cycle.progesteroneTests.map((t) => ({ date: t.date, levelNgMl: t.levelNgMl })),
    matings: cycle.matings.map((m) => ({ matingDate: m.matingDate })),
  };

  const phase = derivePhase(input, today);
  const confidence = deriveConfidence(input);
  const fw = fertileWindow(input);
  const whelp = predictedWhelp(input);
  const dayOfSeason = Math.max(0, daysBetween(cycle.startDate, today));
  const ovDay = estimateOvulationDay(input);
  const name = cycle.dog.callName ?? "Dog";
  const accent = ACCENT[phase];

  const signMarkers: TimelineMarker[] = cycle.signs.map((s) => {
    const day = daysBetween(cycle.startDate, s.date);
    return { day, label: SIGN_LABEL[s.type] ?? s.type, sub: `day ${day}`, color: SIGN_COLOR[s.type] ?? "#3b82f6" };
  });

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      {/* Header */}
      <Link href="/seasons" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Seasons
      </Link>

      <div className="mt-3 flex items-center gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold ${accent.av}`}>
          {initial(name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${accent.status}`}>{accent.statusLabel}</span>
          </div>
          <p className="text-sm text-neutral-500">
            {cycle.dog.breed} · {ordinal(seasonNo)} season · day {dayOfSeason}
          </p>
        </div>
        <Link href={`/dogs/${cycle.dog.id}`} className="shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400">
          Profile →
        </Link>
      </div>

      {/* ============ EARLY ============ */}
      {phase === "early" && (
        <>
          <Banner tone="neutral" icon="⏱" title="Early days." body="She's bleeding but not yet ready. The fertile window is still around a week away — these dates sharpen as you test." />

          <SectionLabel title="Where she is" hint="estimate · day-count only" />
          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <CycleTimeline
              minDay={0}
              maxDay={Math.max(22, dayOfSeason + 2)}
              bands={[
                { label: "proestrus", fromDay: 0, toDay: 9, color: PINK },
                { label: "estrus", fromDay: 9, toDay: 16, color: ESTRUS },
                { label: "diestrus", fromDay: 16, toDay: Math.max(22, dayOfSeason + 2), color: DIESTRUS },
              ]}
              window={{ fromDay: fw.estDayRange?.[0] ?? 11, toDay: fw.estDayRange?.[1] ?? 15, estimated: true, label: "est. window" }}
              windowColor={GREEN}
              todayDay={dayOfSeason}
              todayLabel={`Day ${dayOfSeason}`}
              startLabel="day 0"
              endLabel={`~day ${Math.max(22, dayOfSeason + 2)}`}
              markers={signMarkers}
            />
            <TimelineNote tone="blue" body="She's in early proestrus — swollen and bleeding, but she won't stand for a male yet. The hatched band is a rough guess; a progesterone test from around day 7 turns it into real dates." />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <MetricCard label="Mating days (est.)" value="Day 11–15" hint={`~${Math.max(0, 11 - dayOfSeason)}–${Math.max(0, 15 - dayOfSeason)} days away`} />
            <MetricCard label="Predicted whelp" value="—" hint="refines when mated" />
            <MetricCard label="Confidence" value={<><span style={{ color: "#f59e0b" }}>Low</span><ConfidenceDots level={confidence} /></>} hint="no readings yet" />
          </div>

          <SectionLabel title="Start progesterone testing" hint="from ~day 7" />
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-500/30 dark:bg-blue-500/5">
            <p className="mb-3 text-sm text-blue-900 dark:text-blue-200">A first test around day 7 sets a baseline. Test every 2–3 days to catch ovulation.</p>
            <AddReadingForm cycleId={cycle.id} />
          </div>

          <SectionLabel title="Log a sign seen today" />
          <SignLogger cycleId={cycle.id} />
        </>
      )}

      {/* ============ FERTILE ============ */}
      {phase === "fertile" && (
        <>
          <Banner
            tone={confidence === "high" ? "green" : "blue"}
            icon={confidence === "high" ? "🏁" : "🔬"}
            title={confidence === "high" ? "Green light." : "Closing in."}
            body={confidence === "high"
              ? "Behaviour and progesterone agree — the best mating days are now."
              : "She's entering her window. Keep testing every 2–3 days to pin ovulation."}
          />

          <SectionLabel title="Fertile window" hint="zoomed in" />
          <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <CycleTimeline
              minDay={Math.max(0, Math.min(ovDay - 13, dayOfSeason - 2))}
              maxDay={Math.max(ovDay + 6, dayOfSeason + 2)}
              bands={[
                { label: "proestrus", fromDay: 0, toDay: 9, color: PINK },
                { label: "estrus", fromDay: 9, toDay: ovDay + 5, color: ESTRUS },
                { label: "diestrus", fromDay: ovDay + 5, toDay: Math.max(ovDay + 6, dayOfSeason + 2), color: DIESTRUS },
              ]}
              window={
                fw.bestMatingDates.length === 2
                  ? { fromDay: daysBetween(cycle.startDate, fw.bestMatingDates[0]), toDay: daysBetween(cycle.startDate, fw.bestMatingDates[1]), estimated: false, label: "♥ best days" }
                  : { fromDay: ovDay + 2, toDay: ovDay + 4, estimated: true, label: "best days" }
              }
              windowColor={GREEN}
              todayDay={dayOfSeason}
              todayLabel={`Day ${dayOfSeason}`}
              startLabel={`day ${Math.max(0, Math.min(ovDay - 13, dayOfSeason - 2))}`}
              endLabel={`day ${Math.max(ovDay + 6, dayOfSeason + 2)}`}
              markers={signMarkers}
            />
            <TimelineNote
              tone="green"
              body={
                fw.bestMatingDates.length === 2
                  ? `Best mating days: ${fmt(fw.bestMatingDates[0])} and ${fmt(fw.bestMatingDates[1])}, around 48 hours apart.`
                  : "She's in her fertile window. A progesterone test will confirm ovulation and lock the best two mating days."
              }
            />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            {daysStanding(input, today) != null ? (
              <MetricCard
                label="Days standing"
                tint="border-green-200 bg-green-50 dark:border-green-500/30 dark:bg-green-500/10"
                valueColor="text-green-700 dark:text-green-300"
                value={<span className="font-serif text-3xl">{daysStanding(input, today)}</span>}
                hint="standing for the male"
              />
            ) : (
              <MetricCard label="Fertile" tint="border-green-200 bg-green-50 dark:border-green-500/30 dark:bg-green-500/10" valueColor="text-green-700 dark:text-green-300" value="Now" hint="in her window" />
            )}
            {fw.bestMatingDates.length === 2 ? (
              <MetricCard label="Best mating days" value={`${fmt(fw.bestMatingDates[0])} + ${fmt(fw.bestMatingDates[1])}`} hint={`in ${Math.max(0, daysBetween(today, fw.bestMatingDates[0]))} and ${Math.max(0, daysBetween(today, fw.bestMatingDates[1]))} days`} />
            ) : (
              <MetricCard label="Best mating days" value="Test to confirm" hint="needs a progesterone reading" />
            )}
            <MetricCard label="Predicted whelp" value={whelp.date ? `~${fmt(whelp.date)}` : "—"} hint={whelp.date ? "if mated now" : "after ovulation"} />
          </div>

          <SectionLabel title="Log a sign seen today" />
          <SignLogger cycleId={cycle.id} />

          <SectionLabel title="Progesterone" hint={`${cycle.progesteroneTests.length} reading${cycle.progesteroneTests.length === 1 ? "" : "s"}`} />
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            {cycle.progesteroneTests.length > 0 ? (
              <SeasonProgesteroneChart tests={cycle.progesteroneTests.map((t) => ({ date: t.date.toISOString(), levelNgMl: t.levelNgMl }))} />
            ) : (
              <p className="py-4 text-center text-sm text-neutral-400">No readings yet.</p>
            )}
            <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <AddReadingForm cycleId={cycle.id} />
            </div>
          </div>
        </>
      )}

      {/* ============ PREGNANT / ENDED — interim (full views next stage) ============ */}
      {(phase === "pregnant" || phase === "ended") && (
        <div className="mt-5 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="font-semibold">
            {phase === "pregnant" ? "Mated — gestation tracking" : "Season ended"}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {phase === "pregnant"
              ? whelp.date
                ? `Predicted whelp around ${fmt(whelp.date)} (${whelp.rangeStart && whelp.rangeEnd ? `${fmt(whelp.rangeStart)}–${fmt(whelp.rangeEnd)}` : "56–66 days"}).`
                : "A mating is logged for this season."
              : `This season ran ${cycle.endDate ? daysBetween(cycle.startDate, cycle.endDate) : dayOfSeason} days.`}
          </p>
          <p className="mt-3 text-xs text-neutral-400">The full {phase === "pregnant" ? "gestation planner (countdown, milestones, breeding record)" : "ended-season summary"} lands in the next update.</p>
          {cycle.progesteroneTests.length > 0 && (
            <div className="mt-4">
              <SeasonProgesteroneChart tests={cycle.progesteroneTests.map((t) => ({ date: t.date.toISOString(), levelNgMl: t.levelNgMl }))} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Small presentational helpers ----------------------------------------
function SectionLabel({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3 mt-6 flex items-baseline justify-between gap-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">{title}</h2>
      {hint && <span className="text-xs text-neutral-400">{hint}</span>}
    </div>
  );
}

function Banner({ tone, icon, title, body }: { tone: "neutral" | "green" | "blue"; icon: string; title: string; body: string }) {
  const tones = {
    neutral: "border-neutral-200 bg-white text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300",
    green: "border-green-300 bg-green-50 text-green-900 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200",
    blue: "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200",
  };
  return (
    <div className={`mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <span className="text-lg leading-none">{icon}</span>
      <p className="text-sm"><b>{title}</b> {body}</p>
    </div>
  );
}

function TimelineNote({ tone, body }: { tone: "blue" | "green"; body: string }) {
  const colour = tone === "green" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400";
  return (
    <div className="mt-5 flex items-start gap-2.5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
      <span className={`shrink-0 ${colour}`}>ⓘ</span>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">{body}</p>
    </div>
  );
}
