// Lightweight sanity checks for src/lib/cycle.ts (no test framework needed).
//   Run:  npx tsx scripts/cycle-test.ts
import assert from "node:assert";
import {
  derivePhase, deriveConfidence, fertileWindow, predictedWhelp, daysStanding,
  nextSeasonEstimate, gestation, addDays, GESTATION_DAYS,
  type CycleInput,
} from "../src/lib/cycle";

const today = new Date("2026-06-22T12:00:00Z");
const base: CycleInput = { startDate: today, endDate: null, outcome: "in_progress", signs: [], progesterone: [], matings: [] };

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
}

// --- Early state ---
check("early: no data → phase 'early', confidence 'low'", () => {
  const c: CycleInput = { ...base, startDate: addDays(today, -4) };
  assert.equal(derivePhase(c, today), "early");
  assert.equal(deriveConfidence(c), "low");
  const fw = fertileWindow(c);
  assert.equal(fw.estimated, true);
  assert.deepEqual(fw.estDayRange, [11, 15]);
});

// --- Fertile state ---
check("fertile: prog≥5 + standing → 'fertile', confidence 'high'", () => {
  const start = addDays(today, -22);
  const ovDate = addDays(today, -2);
  const c: CycleInput = {
    ...base, startDate: start,
    progesterone: [
      { date: addDays(today, -6), levelNgMl: 1.1 },
      { date: addDays(today, -4), levelNgMl: 2.8 },
      { date: ovDate, levelNgMl: 5.4 },
    ],
    signs: [{ type: "standing", date: addDays(today, -2) }],
  };
  assert.equal(derivePhase(c, today), "fertile");
  assert.equal(deriveConfidence(c), "high");
  const fw = fertileWindow(c);
  assert.equal(fw.estimated, false);
  assert.equal(fw.bestMatingDates.length, 2);
  assert.equal(fw.bestMatingDates[0].getTime(), addDays(ovDate, 2).getTime());
  assert.equal(daysStanding(c, today), 2);
});

// --- Medium confidence ---
check("medium: readings exist but below 5 → confidence 'medium'", () => {
  const c: CycleInput = { ...base, startDate: addDays(today, -10), progesterone: [{ date: addDays(today, -2), levelNgMl: 2.1 }] };
  assert.equal(deriveConfidence(c), "medium");
});

// --- Pregnant state + gestation ---
check("pregnant: a mating → 'pregnant', gestation computes whelp = ov+63", () => {
  const ovDate = addDays(today, -28);
  const c: CycleInput = {
    ...base, startDate: addDays(today, -40), outcome: "mated",
    progesterone: [{ date: ovDate, levelNgMl: 5.4 }],
    matings: [{ matingDate: addDays(today, -26) }, { matingDate: addDays(today, -24) }],
  };
  assert.equal(derivePhase(c, today), "pregnant");
  const g = gestation(c, today);
  assert.ok(g);
  assert.equal(g!.whelpDate.getTime(), addDays(ovDate, GESTATION_DAYS).getTime());
  assert.equal(g!.day, 28);
  assert.equal(g!.trimester, 2);
  assert.equal(g!.milestones.length, 4);
});

// --- Predicted whelp falls back to mean of matings without ovulation ---
check("predictedWhelp: no ovulation → mean of mating dates + 63", () => {
  const c: CycleInput = { ...base, matings: [{ matingDate: new Date("2026-05-18") }, { matingDate: new Date("2026-05-20") }] };
  const w = predictedWhelp(c);
  assert.ok(w.date);
  assert.equal(w.date!.getTime(), addDays(new Date("2026-05-19"), GESTATION_DAYS).getTime());
});

// --- Next-season estimate ---
check("nextSeason: <2 cycles → unknown; ≥2 → avg gap", () => {
  assert.equal(nextSeasonEstimate([new Date("2026-01-01")]).known, false);
  const ns = nextSeasonEstimate([new Date("2025-06-01"), new Date("2026-01-01")]);
  assert.equal(ns.known, true);
  if (ns.known) assert.equal(ns.avgGapDays, 214);
});

// --- Ended state ---
check("ended: endDate set → 'ended'", () => {
  const c: CycleInput = { ...base, startDate: addDays(today, -30), endDate: addDays(today, -2) };
  assert.equal(derivePhase(c, today), "ended");
});

console.log(`\nAll ${passed} cycle.ts checks passed.`);
