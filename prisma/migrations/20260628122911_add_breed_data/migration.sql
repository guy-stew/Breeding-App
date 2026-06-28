-- CreateTable
CREATE TABLE "Breed" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "top10" BOOLEAN NOT NULL DEFAULT false,
    "geneticDiversityPriority" BOOLEAN NOT NULL DEFAULT false,
    "breedClubScheme" BOOLEAN NOT NULL DEFAULT false,
    "breedWatch" BOOLEAN NOT NULL DEFAULT false,
    "goodPractice" JSONB NOT NULL,
    "bestPractice" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Breed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreedDataImport" (
    "id" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "breedCount" INTEGER NOT NULL,
    "source" TEXT,
    "notes" TEXT,

    CONSTRAINT "BreedDataImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Breed_name_key" ON "Breed"("name");

-- CreateIndex
CREATE INDEX "Breed_name_idx" ON "Breed"("name");
