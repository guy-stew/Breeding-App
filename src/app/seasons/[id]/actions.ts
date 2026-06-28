"use server";

import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { revalidatePath } from "next/cache";
import type { HeatSignKind } from "@/lib/cycle";

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
