-- CreateEnum
CREATE TYPE "StoreItemCategory" AS ENUM ('CLOTHING', 'FOOTWEAR', 'ACCESSORIES');

-- CreateTable
CREATE TABLE "StoreItem" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "StoreItemCategory" NOT NULL,
    "description" TEXT,
    "price" INTEGER,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreItemImage" (
    "id" TEXT NOT NULL,
    "storeItemId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StoreItemImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreItem_storeId_idx" ON "StoreItem"("storeId");

-- AddForeignKey
ALTER TABLE "StoreItem" ADD CONSTRAINT "StoreItem_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreItemImage" ADD CONSTRAINT "StoreItemImage_storeItemId_fkey" FOREIGN KEY ("storeItemId") REFERENCES "StoreItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
