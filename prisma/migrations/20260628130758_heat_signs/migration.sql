-- CreateEnum
CREATE TYPE "HeatSignType" AS ENUM ('discharge_start', 'swelling', 'discharge_change', 'tail_flagging', 'standing', 'refusing');

-- CreateEnum
CREATE TYPE "HeatOutcome" AS ENUM ('in_progress', 'not_mated', 'mated', 'not_pregnant', 'pregnant');

-- AlterTable
ALTER TABLE "HeatCycle" ADD COLUMN     "outcome" "HeatOutcome" NOT NULL DEFAULT 'in_progress',
ADD COLUMN     "scanLitterCount" INTEGER;

-- AlterTable
ALTER TABLE "Mating" ADD COLUMN     "heatCycleId" TEXT;

-- CreateTable
CREATE TABLE "HeatSign" (
    "id" TEXT NOT NULL,
    "heatCycleId" TEXT NOT NULL,
    "type" "HeatSignType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HeatSign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeatSign_heatCycleId_idx" ON "HeatSign"("heatCycleId");

-- CreateIndex
CREATE INDEX "Mating_heatCycleId_idx" ON "Mating"("heatCycleId");

-- AddForeignKey
ALTER TABLE "Mating" ADD CONSTRAINT "Mating_heatCycleId_fkey" FOREIGN KEY ("heatCycleId") REFERENCES "HeatCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeatSign" ADD CONSTRAINT "HeatSign_heatCycleId_fkey" FOREIGN KEY ("heatCycleId") REFERENCES "HeatCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
