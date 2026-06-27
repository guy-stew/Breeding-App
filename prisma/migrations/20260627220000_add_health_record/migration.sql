-- CreateEnum
CREATE TYPE "HealthRecordType" AS ENUM ('vaccination', 'worming', 'flea_treatment', 'vet_check', 'dna_test', 'hip_score', 'elbow_score', 'eye_test', 'other');

-- CreateTable
CREATE TABLE "HealthRecord" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "type" "HealthRecordType" NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "nextDueDate" TIMESTAMP(3),
    "vet" TEXT,
    "result" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HealthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthRecord_dogId_idx" ON "HealthRecord"("dogId");

-- CreateIndex
CREATE INDEX "HealthRecord_dogId_date_idx" ON "HealthRecord"("dogId", "date");

-- AddForeignKey
ALTER TABLE "HealthRecord" ADD CONSTRAINT "HealthRecord_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
