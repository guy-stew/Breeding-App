-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('active', 'sold', 'withdrawn');

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "puppyId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "priceText" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_puppyId_key" ON "Listing"("puppyId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_puppyId_fkey" FOREIGN KEY ("puppyId") REFERENCES "Puppy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
