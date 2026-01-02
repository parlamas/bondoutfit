-- AlterTable
ALTER TABLE "StoreItemImage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "StoreItemImage_storeItemId_idx" ON "StoreItemImage"("storeItemId");
