// ============================================================
//  Seed script — fills an empty database with realistic sample
//  data so you've got something to look at while building.
//
//  Run it with:   npx prisma db seed
//  (configured in prisma.config.ts -> migrations.seed)
//
//  It's safe to run more than once: it clears the sample rows
//  first, so you always get a clean, predictable starting set
//  rather than piling up duplicates.
// ============================================================

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// A fixed set of collar colours, in the order pups are tagged.
const COLLARS = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink"];

async function main() {
  console.log("Seeding database...");

  // ----------------------------------------------------------
  // 1. Wipe any previous sample data, in an order that respects
  //    the relationships (children before parents).
  // ----------------------------------------------------------
  await prisma.weightLog.deleteMany();
  await prisma.puppy.deleteMany();
  await prisma.litter.deleteMany();
  await prisma.mating.deleteMany();
  await prisma.dog.deleteMany();
  await prisma.breeder.deleteMany();

  // ----------------------------------------------------------
  // 2. The breeder (the account everything hangs off).
  // ----------------------------------------------------------
  const breeder = await prisma.breeder.create({
    data: {
      name: "Guy Stewart",
      kennelName: "Willowbrook",
      email: "guy_stew@hotmail.com",
      phone: "07700 900123",
      ukNation: "england",
      isLicensed: true,
      licenceNumber: "AWL-2024-0481",
      licenceAuthority: "Surrey Heath Borough Council",
    },
  });

  // ----------------------------------------------------------
  // 3. The dam and the sire (two Dog records).
  // ----------------------------------------------------------
  const dam = await prisma.dog.create({
    data: {
      breederId: breeder.id,
      callName: "Maple",
      registeredName: "Willowbrook Autumn Maple",
      breed: "Cocker Spaniel",
      sex: "bitch",
      colour: "Golden",
      dateOfBirth: new Date("2022-03-14"),
      microchip: "956000010123456",
      status: "active",
    },
  });

  const sire = await prisma.dog.create({
    data: {
      breederId: breeder.id,
      callName: "Rufus",
      registeredName: "Oakfield Red Rufus",
      breed: "Cocker Spaniel",
      sex: "dog",
      colour: "Red",
      dateOfBirth: new Date("2021-06-02"),
      microchip: "956000010987654",
      status: "active",
    },
  });

  // ----------------------------------------------------------
  // 4. The mating, then the litter it produced.
  // ----------------------------------------------------------
  const mating = await prisma.mating.create({
    data: {
      damId: dam.id,
      sireId: sire.id,
      matingDate: new Date("2026-04-21"),
      method: "natural",
      predictedWhelpDate: new Date("2026-06-23"),
    },
  });

  const litter = await prisma.litter.create({
    data: {
      breederId: breeder.id,
      matingId: mating.id,
      name: "Maple's litter",
      whelpDate: new Date("2026-06-23"),
      totalBorn: 7,
      bornAlive: 7,
      status: "whelped",
    },
  });

  // ----------------------------------------------------------
  // 5. Seven puppies. Each puppy is also a Dog record (the dog
  //    holds parentage + weights; the puppy holds birth detail).
  //    We create the Dog first, then the Puppy that points to it.
  // ----------------------------------------------------------
  const birthWeights = [402, 388, 365, 332, 354, 377, 348]; // grams
  const sexes: ("dog" | "bitch")[] = [
    "dog", "dog", "bitch", "bitch", "bitch", "dog", "bitch",
  ];

  for (let i = 0; i < 7; i++) {
    const pupDog = await prisma.dog.create({
      data: {
        breederId: breeder.id,
        callName: `${COLLARS[i]} pup`,
        breed: "Cocker Spaniel",
        sex: sexes[i],
        dateOfBirth: litter.whelpDate,
        sireId: sire.id,
        damId: dam.id,
        status: "active",
      },
    });

    await prisma.puppy.create({
      data: {
        litterId: litter.id,
        dogId: pupDog.id,
        birthOrder: i + 1,
        collarColour: COLLARS[i],
        birthWeightG: birthWeights[i],
        sex: sexes[i],
        status: "available",
      },
    });

    // Four days of weights, climbing ~10% a day (one pup dips,
    // so the app has something to flag on screen).
    let w = birthWeights[i];
    for (let day = 0; day < 4; day++) {
      const date = new Date(litter.whelpDate);
      date.setDate(date.getDate() + day);

      // The Yellow pup loses a little on day 2 — a realistic worry.
      if (COLLARS[i] === "Yellow" && day === 2) {
        w = w - 8;
      } else {
        w = Math.round(w * 1.1);
      }

      await prisma.weightLog.create({
        data: { dogId: pupDog.id, date, weightG: w },
      });
    }
  }

  console.log("Done. Seeded 1 breeder, 2 adults, 1 litter, 7 puppies.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
