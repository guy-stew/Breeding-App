"use server";

import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { revalidatePath } from "next/cache";
import { addDays, GESTATION_DAYS, type HeatSignKind } from "@/lib/cycle";

const SIGN_TYPES: HeatSignKind[] = [
  "discharge_start", "swelling", "discharge_change", "tail_flagging", "standing", "refusing",
];

type Result = { ok: true } | { ok: false; error: string };

async function ownedCycle(cycleId: string) {
  const breeder = await getBreeder();
  if (!breeder) return null;
  const cycle = await prisma.heatCycle.findFirst({
    where: { id: cycleId, deletedAt: null },
    include: { dog: { select: { breederId: true } } },
  });
  if (!cycle || cycle.dog.breederId !== breeder.id) return null;
  return cycle;
}

/** Log a dated behavioural sign (powers the quick-log grid). Date = today. */
export async function logHeatSign(cycleId: string, type: string): Promise<Result> {
  if (!SIGN_TYPES.includes(type as HeatSignKind)) {
    return { ok: false, error: "Unknown sign type." };
  }
  const cycle = await ownedCycle(cycleId);
  if (!cycle) return { ok: false, error: "Season not found." };

  await prisma.heatSign.create({
    data: { heatCycleId: cycleId, type: type as HeatSignKind, date: new Date() },
  });
  revalidatePath(`/seasons/${cycleId}`);
  return { ok: true };
}

/** Add a progesterone reading to a season. */
export async function logProgesterone(
  cycleId: string,
  date: string,
  levelNgMl: number,
): Promise<Result> {
  const cycle = await ownedCycle(cycleId);
  if (!cycle) return { ok: false, error: "Season not found." };

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return { ok: false, error: "Please enter a valid date." };
  if (!(levelNgMl >= 0)) return { ok: false, error: "Please enter a level in ng/ml." };

  await prisma.progesteroneTest.create({
    data: { heatCycleId: cycleId, date: d, levelNgMl },
  });
  revalidatePath(`/seasons/${cycleId}`);
  return { ok: true };
}

/** Log a mating for this season → flips the page to the pregnant/gestation view. */
export async function logMating(
  cycleId: string,
  sireId: string,
  date: string,
): Promise<Result> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "Not signed in." };

  const cycle = await prisma.heatCycle.findFirst({
    where: { id: cycleId, deletedAt: null, dog: { breederId: breeder.id } },
    select: { id: true, dogId: true },
  });
  if (!cycle) return { ok: false, error: "Season not found." };

  const sire = await prisma.dog.findFirst({
    where: { id: sireId, breederId: breeder.id, deletedAt: null },
    select: { id: true },
  });
  if (!sire) return { ok: false, error: "Please choose a sire." };

  const matingDate = new Date(date);
  if (Number.isNaN(matingDate.getTime())) return { ok: false, error: "Please enter a valid mating date." };

  await prisma.mating.create({
    data: {
      damId: cycle.dogId,
      sireId,
      heatCycleId: cycleId,
      matingDate,
      predictedWhelpDate: addDays(matingDate, GESTATION_DAYS),
    },
  });
  await prisma.heatCycle.update({ where: { id: cycleId }, data: { outcome: "mated" } });

  revalidatePath(`/seasons/${cycleId}`);
  return { ok: true };
}

/** Record the outcome of a confirmation scan from the scan-due banner. */
export async function recordScanOutcome(
  cycleId: string,
  pregnant: boolean,
  count?: number,
): Promise<Result> {
  const cycle = await ownedCycle(cycleId);
  if (!cycle) return { ok: false, error: "Season not found." };

  await prisma.heatCycle.update({
    where: { id: cycleId },
    data: {
      outcome: pregnant ? "pregnant" : "not_pregnant",
      scanLitterCount: pregnant ? (count && count > 0 ? count : null) : null,
    },
  });
  revalidatePath(`/seasons/${cycleId}`);
  return { ok: true };
}
