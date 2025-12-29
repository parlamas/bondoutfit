/*
  Warnings:

  - You are about to drop the column `storePhone` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `customerCity` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - Added the required column `phoneNumber` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Made the column `state` on table `Store` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `city` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Store" DROP COLUMN "storePhone",
ADD COLUMN     "phoneArea" TEXT,
ADD COLUMN     "phoneCountry" TEXT,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ALTER COLUMN "state" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "customerCity",
DROP COLUMN "phone",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "phoneArea" TEXT,
ADD COLUMN     "phoneCountry" TEXT,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "zip" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL;
