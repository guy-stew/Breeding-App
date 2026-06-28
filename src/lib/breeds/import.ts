// Shared breed-data import: full-replace the Breed table from parsed rows
// and record a BreedDataImport for provenance. Used by both the seed script
// and the in-app CSV refresh. Relative import of the generated client so it
// resolves under tsx (seed) and Next (admin) alike.
import type { PrismaClient, Prisma } from "../../generated/prisma/client";
import type { ParsedBreed } from "./parse";

export async function replaceBreeds(
  prisma: PrismaClient,
  breeds: ParsedBreed[],
  source: string,
): Promise<number> {
  const data = breeds.map((b) => ({
    name: b.name,
    top10: b.top10,
    geneticDiversityPriority: b.geneticDiversityPriority,
    breedClubScheme: b.breedClubScheme,
    breedWatch: b.breedWatch,
    // Round-trip through JSON to drop any `undefined` keys (Prisma's Json
    // input type rejects them) and give clean stored values.
    goodPractice: JSON.parse(JSON.stringify(b.goodPractice)) as Prisma.InputJsonValue,
    bestPractice: JSON.parse(JSON.stringify(b.bestPractice)) as Prisma.InputJsonValue,
  }));

  await prisma.breed.deleteMany({});
  if (data.length > 0) await prisma.breed.createMany({ data });
  await prisma.breedDataImport.create({ data: { breedCount: data.length, source } });
  return data.length;
}
