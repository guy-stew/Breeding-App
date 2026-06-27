-- AlterTable
ALTER TABLE "Breeder" ADD COLUMN "supabaseUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Breeder_supabaseUserId_key" ON "Breeder"("supabaseUserId");
