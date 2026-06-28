// ============================================================
//  Season / heat-cycle computation — pure, UI-free, testable.
//
//  The detail page is ONE layout that re-skins itself per phase
//  (early → fertile → pregnant → ended). Which state renders is
//  DERIVED here from data; nothing about phase is stored. All date
//  maths lives here so components never hand-compute dates.
// ============================================================

const DAY = 1000 * 60 * 60 * 24;

// --- Tunable assumptions (rules of thumb — never presented as fact) -------
export const OVULATION_NG_ML = 5; // first progesterone reading ≥ this ≈ ovulation
export const LH_SURGE_NG_ML = 2;
export const GESTATION_DAYS = 63; // ovulation → whelp
export const GESTATION_MIN = 56;
export const GESTATION_MAX = 66;
const EST_OVULATION_DAY = 12; // day-count fallback: estrus follows ~9d proestrus
const EST_MATING_START = 11; // breed-average best-mating window (no data yet)
const EST_MATING_END = 15;

export type HeatSignKind =
  | "discharge_start"
  | "swelling"
  | "discharge_change"
  | "tail_flagging"
  | "standing"
  | "refusing";

export type CycleOutcome =
  | "in_progress"
  | "not_mated"
  | "mated"
  | "not_pregnant"
  | "pregnant";

export type Phase = "early" | "fertile" | "pregnant" | "ended";
export type Confidence = "low" | "medium" | "high";

export type CycleSign = { type: HeatSignKind; date: Date };
export type ProgReading = { date: Date; levelNgMl: number };
export type CycleMating = { matingDate: Date | null };

export type CycleInput = {
  startDate: Date;
  endDate: Date | null;
  outcome: CycleOutcome;
  signs: CycleSign[];
  progesterone: ProgReading[]; // any order
  matings: CycleMating[];
};

// --- Small date helpers ----------------------------------------------------
export function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / DAY);
}
export function addDays(date: Date, n: number): Date {
  return new Date(date.getTime() + n * DAY);
}

// --- Signals ---------------------------------------------------------------
function sortedProg(c: CycleInput): ProgReading[] {
  return [...c.progesterone].sort((a, b) => a.date.getTime() - b.date.getTime());
}
function ovulationReading(c: CycleInput): ProgReading | null {
  return sortedProg(c).find((p) => p.levelNgMl >= OVULATION_NG_ML) ?? null;
}
function progesteroneCrossed(c: CycleInput, threshold: number): boolean {
  return c.progesterone.some((p) => p.levelNgMl >= threshold);
}
function standingSigns(c: CycleInput): CycleSign[] {
  return c.signs
    .filter((s) => s.type === "standing")
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
function hasStanding(c: CycleInput): boolean {
  return standingSigns(c).length > 0;
}

/** Estimated ovulation day-of-season (0-indexed). Hormone-led if available. */
export function estimateOvulationDay(c: CycleInput): number {
  const ov = ovulationReading(c);
  if (ov) return daysBetween(c.startDate, ov.date);
  return EST_OVULATION_DAY;
}

// --- Phase + confidence ----------------------------------------------------
export function derivePhase(c: CycleInput, today: Date): Phase {
  // A confirmed-empty or explicitly-not-mated scan ends the season even if a
  // covering mating was logged — check these before the mated→pregnant rule.
  if (c.outcome === "not_pregnant" || c.outcome === "not_mated") return "ended";
  if (c.outcome === "pregnant") return "pregnant";
  if (c.matings.length > 0) return "pregnant";
  if (c.endDate) return "ended";

  const day = daysBetween(c.startDate, today);
  const ov = estimateOvulationDay(c);
  if (hasStanding(c) || progesteroneCrossed(c, OVULATION_NG_ML) || day >= ov - 3) {
    return "fertile";
  }
  return "early";
}

export function deriveConfidence(c: CycleInput): Confidence {
  if (c.progesterone.length === 0) return "low";
  if (progesteroneCrossed(c, OVULATION_NG_ML) && hasStanding(c)) return "high";
  return "medium";
}

// --- Fertile window (estimate, then refine) --------------------------------
export type FertileWindow = {
  estimated: boolean;
  ovulationDate: Date | null;
  bestMatingDates: Date[]; // 0 when only an estimate
  estDayRange: [number, number] | null; // e.g. [11, 15] when no data
};

export function fertileWindow(c: CycleInput): FertileWindow {
  const ov = ovulationReading(c);
  if (ov) {
    return {
      estimated: false,
      ovulationDate: ov.date,
      bestMatingDates: [addDays(ov.date, 2), addDays(ov.date, 4)],
      estDayRange: null,
    };
  }
  return {
    estimated: true,
    ovulationDate: null,
    bestMatingDates: [],
    estDayRange: [EST_MATING_START, EST_MATING_END],
  };
}

/** Day-0 for gestation: ovulation if known, else mean of mating dates. */
function gestationDayZero(c: CycleInput): Date | null {
  const ov = ovulationReading(c);
  if (ov) return ov.date;
  const dates = c.matings.map((m) => m.matingDate).filter((d): d is Date => !!d);
  if (dates.length === 0) return null;
  const mean = dates.reduce((s, d) => s + d.getTime(), 0) / dates.length;
  return new Date(mean);
}

export function predictedWhelp(c: CycleInput): {
  date: Date | null;
  rangeStart: Date | null;
  rangeEnd: Date | null;
} {
  const day0 = gestationDayZero(c);
  if (!day0) return { date: null, rangeStart: null, rangeEnd: null };
  return {
    date: addDays(day0, GESTATION_DAYS),
    rangeStart: addDays(day0, GESTATION_MIN),
    rangeEnd: addDays(day0, GESTATION_MAX),
  };
}

export function daysStanding(c: CycleInput, today: Date): number | null {
  const s = standingSigns(c)[0];
  if (!s) return null;
  return Math.max(0, daysBetween(s.date, today));
}

// --- Next-season estimate (needs ≥ 2 prior closed cycles) ------------------
export type NextSeason =
  | { known: false }
  | { known: true; avgGapDays: number; nextDate: Date };

export function nextSeasonEstimate(pastStartDates: Date[]): NextSeason {
  const sorted = [...pastStartDates].sort((a, b) => a.getTime() - b.getTime());
  if (sorted.length < 2) return { known: false };
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) gaps.push(daysBetween(sorted[i - 1], sorted[i]));
  const avgGap = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  return { known: true, avgGapDays: avgGap, nextDate: addDays(sorted[sorted.length - 1], avgGap) };
}

// --- Gestation (pregnant state) --------------------------------------------
export type Milestone = { key: string; label: string; detail: string; dayOffset: number };

export const GESTATION_MILESTONES: Milestone[] = [
  { key: "scan", label: "Confirmation scan", detail: "window closes day 30", dayOffset: 28 },
  { key: "diet", label: "Increase to puppy diet", detail: "from day 45", dayOffset: 45 },
  { key: "box", label: "Set up whelping box", detail: "from day 58", dayOffset: 58 },
  { key: "due", label: "Due date", detail: "expect whelping · day 63", dayOffset: 63 },
];

export type Gestation = {
  dayZero: Date;
  day: number; // current day of gestation
  total: number; // GESTATION_DAYS
  percent: number; // 0..100
  whelpDate: Date;
  rangeStart: Date;
  rangeEnd: Date;
  countdownDays: number;
  trimester: 1 | 2 | 3;
  milestones: { milestone: Milestone; date: Date; daysAway: number }[];
};

export function gestation(c: CycleInput, today: Date): Gestation | null {
  const dayZero = gestationDayZero(c);
  if (!dayZero) return null;
  const day = Math.max(0, daysBetween(dayZero, today));
  const whelpDate = addDays(dayZero, GESTATION_DAYS);
  const trimester: 1 | 2 | 3 = day < 21 ? 1 : day < 42 ? 2 : 3;
  return {
    dayZero,
    day,
    total: GESTATION_DAYS,
    percent: Math.min(100, Math.round((day / GESTATION_DAYS) * 100)),
    whelpDate,
    rangeStart: addDays(dayZero, GESTATION_MIN),
    rangeEnd: addDays(dayZero, GESTATION_MAX),
    countdownDays: Math.max(0, daysBetween(today, whelpDate)),
    trimester,
    milestones: GESTATION_MILESTONES.map((m) => ({
      milestone: m,
      date: addDays(dayZero, m.dayOffset),
      daysAway: daysBetween(today, addDays(dayZero, m.dayOffset)),
    })),
  };
}
