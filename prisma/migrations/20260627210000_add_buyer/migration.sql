-- CreateEnum
CREATE TYPE "BuyerStatus" AS ENUM ('enquiry', 'waitlist', 'deposit_paid', 'collected');

-- CreateTable
CREATE TABLE "Buyer" (
    "id" TEXT NOT NULL,
    "breederId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "status" "BuyerStatus" NOT NULL DEFAULT 'enquiry',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Buyer_breederId_idx" ON "Buyer"("breederId");

-- AddForeignKey
ALTER TABLE "Buyer" ADD CONSTRAINT "Buyer_breederId_fkey" FOREIGN KEY ("breederId") REFERENCES "Breeder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: add buyerId to Puppy
ALTER TABLE "Puppy" ADD COLUMN "buyerId" TEXT;

-- AddForeignKey
ALTER TABLE "Puppy" ADD CONSTRAINT "Puppy_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
