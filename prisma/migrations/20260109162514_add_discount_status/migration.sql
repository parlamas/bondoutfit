-- CreateEnum
CREATE TYPE "DiscountStatus" AS ENUM ('DRAFT', 'POSTED', 'DISMOUNTED', 'DELETED');

-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "status" "DiscountStatus" NOT NULL DEFAULT 'DRAFT';
