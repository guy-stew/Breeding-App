-- CreateTable
CREATE TABLE "HeatCycle" (
    "id" TEXT NOT NULL,
    "dogId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HeatCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgesteroneTest" (
    "id" TEXT NOT NULL,
    "heatCycleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "levelNgMl" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProgesteroneTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeatCycle_dogId_idx" ON "HeatCycle"("dogId");

-- CreateIndex
CREATE INDEX "ProgesteroneTest_heatCycleId_idx" ON "ProgesteroneTest"("heatCycleId");

-- AddForeignKey
ALTER TABLE "HeatCycle" ADD CONSTRAINT "HeatCycle_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgesteroneTest" ADD CONSTRAINT "ProgesteroneTest_heatCycleId_fkey" FOREIGN KEY ("heatCycleId") REFERENCES "HeatCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
