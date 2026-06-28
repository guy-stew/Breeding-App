"use server";

import { prisma } from "@/lib/prisma";
import { getBreeder } from "@/lib/breeder";
import { breedsFromCsv, type BreedTest } from "@/lib/breeds/parse";
import { replaceBreeds } from "@/lib/breeds/import";
import { revalidatePath } from "next/cache";

export type BreedRecommendation = {
  name: string;
  goodPractice: BreedTest[];
  bestPractice: BreedTest[];
  top10: boolean;
  geneticDiversityPriority: boolean;
  breedClubScheme: boolean;
  breedWatch: boolean;
};

/** Fetch a single breed's recommended tests (called when a breed is picked). */
export async function getBreedTests(name: string): Promise<BreedRecommendation | null> {
  const breeder = await getBreeder();
  if (!breeder) return null;

  const b = await prisma.breed.findFirst({ where: { name, deletedAt: null } });
  if (!b) return null;

  return {
    name: b.name,
    goodPractice: (b.goodPractice as unknown as BreedTest[]) ?? [],
    bestPractice: (b.bestPractice as unknown as BreedTest[]) ?? [],
    top10: b.top10,
    geneticDiversityPriority: b.geneticDiversityPriority,
    breedClubScheme: b.breedClubScheme,
    breedWatch: b.breedWatch,
  };
}

/** Full-replace the breed reference data from a CSV export of the KC sheet. */
export async function importBreedsCsv(
  csv: string,
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const breeder = await getBreeder();
  if (!breeder) return { ok: false, error: "You must be signed in." };

  let parsed;
  try {
    parsed = breedsFromCsv(csv);
  } catch {
    return { ok: false, error: "Could not read that CSV — please check the file." };
  }
  if (parsed.length === 0) {
    return {
      ok: false,
      error: "No breeds found. Make sure the first row is the header and includes a 'Breed' column.",
    };
  }

  const count = await replaceBreeds(prisma, parsed, "CSV import via /settings/breeds");
  revalidatePath("/settings/breeds");
  revalidatePath("/dogs/new");
  return { ok: true, count };
}
