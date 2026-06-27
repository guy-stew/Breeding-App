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
import { redirect } from "next/navigation";

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

// ============================================================
//  addDog — create a new dog record for the current breeder.
//
//  The second write feature. Same shape as logWeight: validate
//  what came in, write it with Prisma, refresh the screens that
//  show dogs. The only genuinely required fields are breed and
//  sex (plus the breeder it belongs to); everything else is
//  optional and simply left blank if not given.
//
//  On success this REDIRECTS back to the home screen rather than
//  returning a result, because adding a dog is a "do it and move
//  on" action — there's nothing to stay on the form for.
// ============================================================

export type AddDogResult =
  // We only ever RETURN on failure; success redirects away.
  { ok: false; error: string };

// The shape of the data the form hands over.
type AddDogInput = {
  callName: string;
  breed: string;
  sex: string;            // must end up as "dog" or "bitch"
  colour?: string;
  dateOfBirth?: string;   // a date string like "2023-04-15", or empty
  microchip?: string;
};

export async function addDog(input: AddDogInput): Promise<AddDogResult> {
  // --- Find the breeder this dog belongs to. ---
  // For now we use the first breeder, same as the home screen does.
  // Once login is added, this becomes "the logged-in breeder".
  const breeder = await prisma.breeder.findFirst({
    where: { deletedAt: null },
  });

  if (!breeder) {
    return { ok: false, error: "No breeder found to attach the dog to." };
  }

  // --- Validation (the clerk checking the slip). ---
  const breed = input.breed?.trim();
  if (!breed) {
    return { ok: false, error: "Breed is required." };
  }

  // Sex must be one of the two allowed values the database accepts.
  if (input.sex !== "dog" && input.sex !== "bitch") {
    return { ok: false, error: "Choose whether the dog is a dog or a bitch." };
  }

  // Date of birth is optional. If given, make sure it's a real date
  // and not in the future (a dog can't be born tomorrow).
  let dob: Date | undefined;
  if (input.dateOfBirth) {
    const parsed = new Date(input.dateOfBirth);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "That date of birth isn't valid." };
    }
    if (parsed.getTime() > Date.now()) {
      return { ok: false, error: "Date of birth can't be in the future." };
    }
    dob = parsed;
  }

  try {
    await prisma.dog.create({
      data: {
        breederId: breeder.id,
        breed,
        sex: input.sex, // already checked to be "dog" | "bitch"
        // Optional fields: only set them if the form actually sent something.
        callName: input.callName?.trim() || null,
        colour: input.colour?.trim() || null,
        microchip: input.microchip?.trim() || null,
        ...(dob ? { dateOfBirth: dob } : {}),
      },
    });
  } catch {
    return { ok: false, error: "Could not save the dog — please try again." };
  }

  // Refresh the home screen so the new dog shows in "My dogs".
  revalidatePath("/");

  // Then send the breeder back home to see it. redirect() ends the
  // action here — nothing after this line runs.
  redirect("/");
}
