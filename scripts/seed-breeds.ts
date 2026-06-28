// One-off seed for the Breed table from the KC snapshot in
// prisma/breed-data.md. Future refreshes happen in-app (/settings/breeds).
//
//   Run:  npx tsx scripts/seed-breeds.ts
import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { breedsFromMarkdown } from "../src/lib/breeds/parse";
import { replaceBreeds } from "../src/lib/breeds/import";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const md = readFileSync("prisma/breed-data.md", "utf8");
  const breeds = breedsFromMarkdown(md);
  console.log(`Parsed ${breeds.length} breeds from breed-data.md`);
  const withTests = breeds.filter((b) => b.goodPractice.length || b.bestPractice.length).length;
  console.log(`  (${withTests} have at least one recommended test)`);
  const n = await replaceBreeds(prisma, breeds, "Seed: KC Health Standard, pulled 28 Jun 2026");
  console.log(`Seeded ${n} breeds into the database.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
