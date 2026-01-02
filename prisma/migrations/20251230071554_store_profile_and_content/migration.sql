-- CreateEnum
CREATE TYPE "StoreImageType" AS ENUM ('LOGO', 'GALLERY');

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "closedDates" TIMESTAMP(3)[],
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "openingHours" JSONB;

-- CreateTable
CREATE TABLE "StoreImage" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "type" "StoreImageType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreWeeklyDiscount" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "percent" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreWeeklyDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreImage_storeId_idx" ON "StoreImage"("storeId");

-- CreateIndex
CREATE INDEX "StoreWeeklyDiscount_storeId_idx" ON "StoreWeeklyDiscount"("storeId");

-- CreateIndex
CREATE INDEX "Visit_storeId_idx" ON "Visit"("storeId");

-- AddForeignKey
ALTER TABLE "StoreImage" ADD CONSTRAINT "StoreImage_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreWeeklyDiscount" ADD CONSTRAINT "StoreWeeklyDiscount_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
