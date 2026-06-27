// ============================================================
//  src/app/actions.ts — server actions (the "write" side).
//
//  A server action is a function that ALWAYS runs on the server,
//  never in the browser. The "use server" line at the top is the
//  promise that makes that true. A form in the browser can call
//  one of these directly, and Next.js handles getting the data
//  safely across to the server for us.
//
//  Think of it as the clerk standing behind the filing-cabinet
//  slot: the form hands over what you typed, the clerk checks it
//  makes sense, then files it in the right folder.
// ============================================================

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// The shape of what we hand back to the form after a save attempt,
// so the screen can show "Saved" or a clear error instead of just
// failing silently.
export type LogWeightResult =
  | { ok: true; weightG: number }
  | { ok: false; error: string };

// ------------------------------------------------------------
//  logWeight — record one puppy's weight for one day.
//
//  Note we save against dogId, NOT the puppy's own id. In this
//  schema a WeightLog hangs off the Dog record, so a kept puppy
//  keeps ONE continuous weight history from birth into adulthood.
//  Every puppy has its own Dog record (puppy.dogId), so that's
//  the handle we use here.
// ------------------------------------------------------------
export async function logWeight(
  dogId: string,
  weightG: number,
  date?: Date,
): Promise<LogWeightResult> {
  // --- Validation (the clerk checking the slip before filing) ---

  if (!dogId) {
    return { ok: false, error: "No puppy selected." };
  }

  // weightG arrives already converted to grams by the form. Guard
  // against nonsense: must be a real, positive, sensible number.
  if (!Number.isFinite(weightG) || weightG <= 0) {
    return { ok: false, error: "Enter a weight greater than zero." };
  }

  // A newborn pup can be ~150g; a giant breed adult ~90,000g (90kg).
  // Anything outside this is almost certainly a typo (e.g. grams
  // typed where kilograms were meant). Reject early with a clear
  // message rather than quietly storing a wrong number.
  if (weightG > 120000) {
    return {
      ok: false,
      error: "That weight looks too high — did you mean kilograms?",
    };
  }

  // The schema stores grams as a whole number (no decimals), so
  // round here. Rounding once, on the way in, is what keeps the
  // stored history clean.
  const grams = Math.round(weightG);

  try {
    await prisma.weightLog.create({
      data: {
        dogId,
        weightG: grams,
        // If no date is passed, the schema defaults to "now".
        ...(date ? { date } : {}),
      },
    });
  } catch {
    return {
      ok: false,
      error: "Could not save — please try again.",
    };
  }

  // Tell Next.js the data on these pages has changed, so when they
  // re-render they show the new weight straight away rather than a
  // stale cached copy.
  revalidatePath("/weigh-in");
  revalidatePath("/");

  return { ok: true, weightG: grams };
}
