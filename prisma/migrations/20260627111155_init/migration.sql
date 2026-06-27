-- CreateEnum
CREATE TYPE "UkNation" AS ENUM ('england', 'wales', 'scotland', 'ni');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('dog', 'bitch');

-- CreateEnum
CREATE TYPE "Ownership" AS ENUM ('owned', 'external', 'co_owned');

-- CreateEnum
CREATE TYPE "DogStatus" AS ENUM ('active', 'retired', 'deceased');

-- CreateEnum
CREATE TYPE "MatingMethod" AS ENUM ('natural', 'ai_fresh', 'ai_chilled', 'ai_frozen');

-- CreateEnum
CREATE TYPE "LitterStatus" AS ENUM ('expecting', 'whelped', 'weaning', 'ready', 'all_homed');

-- CreateEnum
CREATE TYPE "PuppyStatus" AS ENUM ('available', 'reserved', 'sold', 'kept', 'deceased');

-- CreateTable
CREATE TABLE "Breeder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kennelName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "ukNation" "UkNation" NOT NULL DEFAULT 'england',
    "isLicensed" BOOLEAN NOT NULL DEFAULT false,
    "licenceNumber" TEXT,
    "licenceAuthority" TEXT,
    "licenceExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Breeder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dog" (
    "id" TEXT NOT NULL,
    "breederId" TEXT NOT NULL,
    "registeredName" TEXT,
    "callName" TEXT,
    "breed" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "colour" TEXT,
    "markings" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "microchip" TEXT,
    "kcRegNumber" TEXT,
    "sireId" TEXT,
    "damId" TEXT,
    "ownership" "Ownership" NOT NULL DEFAULT 'owned',
    "status" "DogStatus" NOT NULL DEFAULT 'active',
    "caesareanCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Dog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mating" (
    "id" TEXT NOT NULL,
    "damId" TEXT NOT NULL,
    "sireId" TEXT NOT NULL,
    "matingDate" TIMESTAMP(3),
    "method" "MatingMethod" NOT NULL DEFAULT 'natural',
    "predictedWhelpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Mating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Litter" (
    "id" TEXT NOT NULL,
    "breederId" TEXT NOT NULL,
    "matingId" TEXT,
    "name" TEXT,
    "whelpDate" TIMESTAMP(3) NOT NULL,
    "totalBorn" INTEGER,
    "bornAlive" INTEGER,
    "notes" TEXT,
    "status" "LitterStatus" NOT NULL DEFAULT 'whelped',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Litter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Puppy" (
    "id" TEXT NOT NULL,
    "litterId" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "birthOrder" INTEGER,
    "collarColour" TEXT,
    "birthWeightG" INTEGER,
    "sex" "Sex" NOT NULL,
    "markings" TEXT,
    "palateCheck" BOOLEAN,
    "microchip" TEXT,
    "microchipDate" TIMESTAMP(3),
    "status" "PuppyStatus" NOT NULL DEFAULT 'available',
    "priceP" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Puppy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightLog" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weightG" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WeightLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Breeder_email_key" ON "Breeder"("email");

-- CreateIndex
CREATE INDEX "Dog_breederId_idx" ON "Dog"("breederId");

-- CreateIndex
CREATE INDEX "Mating_damId_idx" ON "Mating"("damId");

-- CreateIndex
CREATE INDEX "Mating_sireId_idx" ON "Mating"("sireId");

-- CreateIndex
CREATE UNIQUE INDEX "Litter_matingId_key" ON "Litter"("matingId");

-- CreateIndex
CREATE INDEX "Litter_breederId_idx" ON "Litter"("breederId");

-- CreateIndex
CREATE UNIQUE INDEX "Puppy_dogId_key" ON "Puppy"("dogId");

-- CreateIndex
CREATE INDEX "Puppy_litterId_idx" ON "Puppy"("litterId");

-- CreateIndex
CREATE INDEX "WeightLog_dogId_idx" ON "WeightLog"("dogId");

-- CreateIndex
CREATE INDEX "WeightLog_dogId_date_idx" ON "WeightLog"("dogId", "date");

-- AddForeignKey
ALTER TABLE "Dog" ADD CONSTRAINT "Dog_breederId_fkey" FOREIGN KEY ("breederId") REFERENCES "Breeder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dog" ADD CONSTRAINT "Dog_sireId_fkey" FOREIGN KEY ("sireId") REFERENCES "Dog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dog" ADD CONSTRAINT "Dog_damId_fkey" FOREIGN KEY ("damId") REFERENCES "Dog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mating" ADD CONSTRAINT "Mating_damId_fkey" FOREIGN KEY ("damId") REFERENCES "Dog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mating" ADD CONSTRAINT "Mating_sireId_fkey" FOREIGN KEY ("sireId") REFERENCES "Dog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Litter" ADD CONSTRAINT "Litter_breederId_fkey" FOREIGN KEY ("breederId") REFERENCES "Breeder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Litter" ADD CONSTRAINT "Litter_matingId_fkey" FOREIGN KEY ("matingId") REFERENCES "Mating"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Puppy" ADD CONSTRAINT "Puppy_litterId_fkey" FOREIGN KEY ("litterId") REFERENCES "Litter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Puppy" ADD CONSTRAINT "Puppy_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightLog" ADD CONSTRAINT "WeightLog_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
