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
import { getBreeder } from "@/lib/breeder";
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

// ============================================================
//  updateDog — edit an existing dog record.
//
//  Same shape as addDog but updates instead of creates, and
//  includes extra fields (registeredName, markings, kcRegNumber)
//  that the quick-add form skips.
// ============================================================

type UpdateDogInput = {
  id: string;
  callName: string;
  registeredName?: string;
  breed: string;
  sex: string;
  colour?: string;
  markings?: string;
  dateOfBirth?: string;
  microchip?: string;
  kcRegNumber?: string;
};

export async function updateDog(
  input: UpdateDogInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "Not logged in." };

  // Make sure this dog belongs to the logged-in breeder.
  const existing = await prisma.dog.findFirst({
    where: { id: input.id, breederId: breeder.id, deletedAt: null },
  });
  if (!existing) return { ok: false, error: "Dog not found." };

  const breed = input.breed?.trim();
  if (!breed) return { ok: false, error: "Breed is required." };

  if (input.sex !== "dog" && input.sex !== "bitch") {
    return { ok: false, error: "Choose whether the dog is a dog or a bitch." };
  }

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
    await prisma.dog.update({
      where: { id: input.id },
      data: {
        breed,
        sex: input.sex,
        callName: input.callName?.trim() || null,
        registeredName: input.registeredName?.trim() || null,
        colour: input.colour?.trim() || null,
        markings: input.markings?.trim() || null,
        microchip: input.microchip?.trim() || null,
        kcRegNumber: input.kcRegNumber?.trim() || null,
        ...(dob ? { dateOfBirth: dob } : {}),
      },
    });
  } catch {
    return { ok: false, error: "Could not save — please try again." };
  }

  revalidatePath(`/dogs/${input.id}`);
  revalidatePath("/");
  redirect(`/dogs/${input.id}`);
}

// ============================================================
//  createLitter — record a new mating + litter in one step.
//
//  The breeder picks a dam and sire from their dogs, enters the
//  mating and whelp dates, and the action creates both the Mating
//  and the Litter records. Puppies are added separately afterwards.
// ============================================================

type CreateLitterInput = {
  damId: string;
  sireId: string;
  matingDate?: string;
  method?: string;
  name?: string;
  whelpDate: string;
  totalBorn?: string;
  bornAlive?: string;
  notes?: string;
};

export async function createLitter(
  input: CreateLitterInput,
): Promise<{ ok: true; litterId: string } | { ok: false; error: string }> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "Not logged in." };

  if (!input.damId) return { ok: false, error: "Please select a dam." };
  if (!input.sireId) return { ok: false, error: "Please select a sire." };

  const whelpDate = new Date(input.whelpDate);
  if (Number.isNaN(whelpDate.getTime())) {
    return { ok: false, error: "Please enter a valid whelp date." };
  }

  const matingDate = input.matingDate ? new Date(input.matingDate) : undefined;
  if (matingDate && Number.isNaN(matingDate.getTime())) {
    return { ok: false, error: "That mating date isn't valid." };
  }

  const validMethods = ["natural", "ai_fresh", "ai_chilled", "ai_frozen"];
  const method = validMethods.includes(input.method ?? "")
    ? (input.method as "natural" | "ai_fresh" | "ai_chilled" | "ai_frozen")
    : "natural";

  const totalBorn = input.totalBorn ? parseInt(input.totalBorn, 10) : undefined;
  const bornAlive = input.bornAlive ? parseInt(input.bornAlive, 10) : undefined;

  try {
    const mating = await prisma.mating.create({
      data: {
        damId: input.damId,
        sireId: input.sireId,
        ...(matingDate ? { matingDate } : {}),
        method,
      },
    });

    const litter = await prisma.litter.create({
      data: {
        breederId: breeder.id,
        matingId: mating.id,
        name: input.name?.trim() || null,
        whelpDate,
        ...(totalBorn !== undefined && !Number.isNaN(totalBorn)
          ? { totalBorn }
          : {}),
        ...(bornAlive !== undefined && !Number.isNaN(bornAlive)
          ? { bornAlive }
          : {}),
        notes: input.notes?.trim() || null,
        status: "whelped",
      },
    });

    revalidatePath("/");
    return { ok: true, litterId: litter.id };
  } catch {
    return { ok: false, error: "Could not save the litter — please try again." };
  }
}

// ============================================================
//  updateLitter — edit an existing litter's details.
// ============================================================

type UpdateLitterInput = {
  id: string;
  name?: string;
  whelpDate: string;
  totalBorn?: string;
  bornAlive?: string;
  notes?: string;
  status?: string;
};

export async function updateLitter(
  input: UpdateLitterInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "Not logged in." };

  const existing = await prisma.litter.findFirst({
    where: { id: input.id, breederId: breeder.id, deletedAt: null },
  });
  if (!existing) return { ok: false, error: "Litter not found." };

  const whelpDate = new Date(input.whelpDate);
  if (Number.isNaN(whelpDate.getTime())) {
    return { ok: false, error: "Please enter a valid whelp date." };
  }

  const validStatuses = ["expecting", "whelped", "weaning", "ready", "all_homed"];
  const status = validStatuses.includes(input.status ?? "")
    ? (input.status as "expecting" | "whelped" | "weaning" | "ready" | "all_homed")
    : undefined;

  const totalBorn = input.totalBorn ? parseInt(input.totalBorn, 10) : undefined;
  const bornAlive = input.bornAlive ? parseInt(input.bornAlive, 10) : undefined;

  try {
    await prisma.litter.update({
      where: { id: input.id },
      data: {
        name: input.name?.trim() || null,
        whelpDate,
        ...(totalBorn !== undefined && !Number.isNaN(totalBorn)
          ? { totalBorn }
          : {}),
        ...(bornAlive !== undefined && !Number.isNaN(bornAlive)
          ? { bornAlive }
          : {}),
        notes: input.notes?.trim() || null,
        ...(status ? { status } : {}),
      },
    });
  } catch {
    return { ok: false, error: "Could not save — please try again." };
  }

  revalidatePath(`/litters/${input.id}`);
  revalidatePath("/");
  redirect(`/litters/${input.id}`);
}

// ============================================================
//  addPuppy — add a puppy to an existing litter.
//
//  Creates a Dog record (breed/sex/DOB from parents + litter)
//  AND a Puppy record linked to it, in one step.
// ============================================================

type AddPuppyInput = {
  litterId: string;
  sex: string;
  collarColour?: string;
  birthOrder?: string;
  birthWeightG?: string;
};

export async function addPuppy(
  input: AddPuppyInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "Not logged in." };

  const litter = await prisma.litter.findFirst({
    where: { id: input.litterId, breederId: breeder.id, deletedAt: null },
    include: {
      mating: {
        include: {
          dam: { select: { id: true, breed: true } },
          sire: { select: { id: true } },
        },
      },
    },
  });
  if (!litter) return { ok: false, error: "Litter not found." };

  if (input.sex !== "dog" && input.sex !== "bitch") {
    return { ok: false, error: "Please choose dog or bitch." };
  }

  const birthOrder = input.birthOrder ? parseInt(input.birthOrder, 10) : undefined;
  const birthWeightG = input.birthWeightG
    ? Math.round(parseFloat(input.birthWeightG))
    : undefined;

  const breed = litter.mating?.dam?.breed ?? "Unknown";

  try {
    // Create the Dog record first.
    const pupDog = await prisma.dog.create({
      data: {
        breederId: breeder.id,
        callName: input.collarColour
          ? `${input.collarColour.trim()} pup`
          : null,
        breed,
        sex: input.sex,
        dateOfBirth: litter.whelpDate,
        sireId: litter.mating?.sire?.id ?? undefined,
        damId: litter.mating?.dam?.id ?? undefined,
        status: "active",
      },
    });

    // Then the Puppy record pointing at it.
    await prisma.puppy.create({
      data: {
        litterId: litter.id,
        dogId: pupDog.id,
        sex: input.sex,
        collarColour: input.collarColour?.trim() || null,
        ...(birthOrder !== undefined && !Number.isNaN(birthOrder)
          ? { birthOrder }
          : {}),
        ...(birthWeightG !== undefined && !Number.isNaN(birthWeightG)
          ? { birthWeightG }
          : {}),
        status: "available",
      },
    });
  } catch {
    return { ok: false, error: "Could not save the puppy — please try again." };
  }

  revalidatePath(`/litters/${input.litterId}`);
  revalidatePath("/");
  redirect(`/litters/${input.litterId}`);
}

// ============================================================
//  createBuyer — add a new buyer/enquiry to the CRM.
// ============================================================

type CreateBuyerInput = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: string;
};

export async function createBuyer(
  input: CreateBuyerInput,
): Promise<{ ok: true; buyerId: string } | { ok: false; error: string }> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "Not logged in." };

  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Buyer name is required." };

  const validStatuses = ["enquiry", "waitlist", "deposit_paid", "collected"];
  const status = validStatuses.includes(input.status ?? "")
    ? (input.status as "enquiry" | "waitlist" | "deposit_paid" | "collected")
    : "enquiry";

  try {
    const buyer = await prisma.buyer.create({
      data: {
        breederId: breeder.id,
        name,
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        address: input.address?.trim() || null,
        notes: input.notes?.trim() || null,
        status,
      },
    });
    return { ok: true, buyerId: buyer.id };
  } catch {
    return { ok: false, error: "Could not save — please try again." };
  }
}

// ============================================================
//  updateBuyer — edit an existing buyer's details.
// ============================================================

type UpdateBuyerInput = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: string;
};

export async function updateBuyer(
  input: UpdateBuyerInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "Not logged in." };

  const existing = await prisma.buyer.findFirst({
    where: { id: input.id, breederId: breeder.id, deletedAt: null },
  });
  if (!existing) return { ok: false, error: "Buyer not found." };

  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Buyer name is required." };

  const validStatuses = ["enquiry", "waitlist", "deposit_paid", "collected"];
  const status = validStatuses.includes(input.status ?? "")
    ? (input.status as "enquiry" | "waitlist" | "deposit_paid" | "collected")
    : undefined;

  try {
    await prisma.buyer.update({
      where: { id: input.id },
      data: {
        name,
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        address: input.address?.trim() || null,
        notes: input.notes?.trim() || null,
        ...(status ? { status } : {}),
      },
    });
  } catch {
    return { ok: false, error: "Could not save — please try again." };
  }

  revalidatePath(`/buyers/${input.id}`);
  revalidatePath("/buyers");
  redirect(`/buyers/${input.id}`);
}

// ============================================================
//  assignBuyer — link a buyer to a puppy (reserve/sell).
// ============================================================

export async function assignBuyer(
  puppyId: string,
  buyerId: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "Not logged in." };

  const puppy = await prisma.puppy.findFirst({
    where: { id: puppyId, deletedAt: null },
    include: { litter: { select: { breederId: true, id: true } } },
  });
  if (!puppy || puppy.litter.breederId !== breeder.id) {
    return { ok: false, error: "Puppy not found." };
  }

  if (buyerId) {
    const buyer = await prisma.buyer.findFirst({
      where: { id: buyerId, breederId: breeder.id, deletedAt: null },
    });
    if (!buyer) return { ok: false, error: "Buyer not found." };
  }

  try {
    await prisma.puppy.update({
      where: { id: puppyId },
      data: {
        buyerId: buyerId,
        ...(buyerId ? { status: "reserved" } : { status: "available" }),
      },
    });
  } catch {
    return { ok: false, error: "Could not save — please try again." };
  }

  revalidatePath(`/litters/${puppy.litter.id}`);
  return { ok: true };
}

export async function addDog(input: AddDogInput): Promise<AddDogResult> {
  // --- Find the breeder this dog belongs to. ---
  const breeder = await getBreeder();

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

// ============================================================
//  10. addHealthRecord — log a vaccination, worming, test, etc.
// ============================================================
type AddHealthRecordInput = {
  dogId: string;
  type: string;
  description: string;
  date: string;
  nextDueDate: string;
  vet: string;
  result: string;
  notes: string;
};

export async function addHealthRecord(
  input: AddHealthRecordInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "Not signed in." };

  const { dogId, type, description, date, nextDueDate, vet, result, notes } =
    input;

  if (!dogId || !type || !date) {
    return { ok: false, error: "Type and date are required." };
  }

  // Verify the dog belongs to this breeder.
  const dog = await prisma.dog.findFirst({
    where: { id: dogId, breederId: breeder.id, deletedAt: null },
  });
  if (!dog) return { ok: false, error: "Dog not found." };

  await prisma.healthRecord.create({
    data: {
      dogId,
      type: type as any,
      description: description || null,
      date: new Date(date),
      nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      vet: vet || null,
      result: result || null,
      notes: notes || null,
    },
  });

  revalidatePath(`/dogs/${dogId}`);
  redirect(`/dogs/${dogId}`);
}

// ============================================================
//  11. deleteHealthRecord — soft-delete a health record.
// ============================================================
export async function deleteHealthRecord(
  recordId: string,
  dogId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "Not signed in." };

  // Verify the record's dog belongs to this breeder.
  const record = await prisma.healthRecord.findFirst({
    where: { id: recordId, deletedAt: null },
    include: { dog: { select: { breederId: true } } },
  });
  if (!record || record.dog.breederId !== breeder.id) {
    return { ok: false, error: "Record not found." };
  }

  await prisma.healthRecord.update({
    where: { id: recordId },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/dogs/${dogId}`);
  return { ok: true };
}

// ============================================================
//  12. createHeatCycle — record a new heat/season for a bitch.
// ============================================================
type CreateHeatCycleInput = {
  dogId: string;
  startDate: string;
  endDate: string;
  notes: string;
};

export async function createHeatCycle(
  input: CreateHeatCycleInput,
): Promise<{ ok: true; cycleId: string } | { ok: false; error: string }> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "Not signed in." };

  const { dogId, startDate, endDate, notes } = input;
  if (!dogId || !startDate) {
    return { ok: false, error: "Start date is required." };
  }

  const dog = await prisma.dog.findFirst({
    where: { id: dogId, breederId: breeder.id, deletedAt: null },
  });
  if (!dog) return { ok: false, error: "Dog not found." };

  const cycle = await prisma.heatCycle.create({
    data: {
      dogId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      notes: notes || null,
    },
  });

  revalidatePath(`/dogs/${dogId}`);
  redirect(`/dogs/${dogId}/heat-cycles/${cycle.id}`);
}

// ============================================================
//  13. addProgesteroneTest — log a blood test result.
// ============================================================
type AddProgTestInput = {
  cycleId: string;
  dogId: string;
  date: string;
  levelNgMl: number;
  notes: string;
};

export async function addProgesteroneTest(
  input: AddProgTestInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "Not signed in." };

  const { cycleId, dogId, date, levelNgMl, notes } = input;
  if (!cycleId || !date || levelNgMl < 0) {
    return { ok: false, error: "Date and level are required." };
  }

  // Verify ownership via the cycle's dog.
  const cycle = await prisma.heatCycle.findFirst({
    where: { id: cycleId, deletedAt: null },
    include: { dog: { select: { breederId: true } } },
  });
  if (!cycle || cycle.dog.breederId !== breeder.id) {
    return { ok: false, error: "Cycle not found." };
  }

  await prisma.progesteroneTest.create({
    data: {
      heatCycleId: cycleId,
      date: new Date(date),
      levelNgMl,
      notes: notes || null,
    },
  });

  revalidatePath(`/dogs/${dogId}/heat-cycles/${cycleId}`);
  return { ok: true };
}

// ============================================================
//  14. createListing — publish a puppy to the marketplace.
// ============================================================
type CreateListingInput = {
  puppyId: string;
  title: string;
  description: string;
  priceText: string;
};

export async function createListing(
  input: CreateListingInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "Not signed in." };

  const { puppyId, title, description, priceText } = input;
  if (!puppyId) return { ok: false, error: "Puppy is required." };

  // Verify the puppy belongs to this breeder (via litter).
  const puppy = await prisma.puppy.findFirst({
    where: { id: puppyId, deletedAt: null },
    include: { litter: { select: { breederId: true } }, listing: true },
  });
  if (!puppy || puppy.litter.breederId !== breeder.id) {
    return { ok: false, error: "Puppy not found." };
  }
  if (puppy.listing) {
    return { ok: false, error: "This puppy already has a listing." };
  }

  await prisma.listing.create({
    data: {
      puppyId,
      title: title || null,
      description: description || null,
      priceText: priceText || null,
    },
  });

  revalidatePath("/listings");
  redirect("/listings");
}

// ============================================================
//  15. updateListingStatus — change listing to sold/withdrawn/active.
// ============================================================
export async function updateListingStatus(
  listingId: string,
  status: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "Not signed in." };

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, deletedAt: null },
    include: {
      puppy: { include: { litter: { select: { breederId: true } } } },
    },
  });
  if (!listing || listing.puppy.litter.breederId !== breeder.id) {
    return { ok: false, error: "Listing not found." };
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: status as any },
  });

  revalidatePath("/listings");
  revalidatePath("/marketplace");
  return { ok: true };
}
