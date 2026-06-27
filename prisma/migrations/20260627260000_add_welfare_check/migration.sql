-- CreateTable
CREATE TABLE "WelfareCheck" (
    "id" TEXT NOT NULL,
    "litterId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "damCondition" TEXT,
    "concerns" TEXT,
    "actionTaken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WelfareCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WelfareCheck_litterId_idx" ON "WelfareCheck"("litterId");

-- CreateIndex
CREATE INDEX "WelfareCheck_litterId_date_idx" ON "WelfareCheck"("litterId", "date");

-- AddForeignKey
ALTER TABLE "WelfareCheck" ADD CONSTRAINT "WelfareCheck_litterId_fkey" FOREIGN KEY ("litterId") REFERENCES "Litter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
