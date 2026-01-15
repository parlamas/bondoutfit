-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('VISIT_REMINDER', 'VISIT_CONFIRMATION', 'DISCOUNT_AVAILABLE', 'NEW_MESSAGE', 'SYSTEM_ALERT');

-- AlterTable
ALTER TABLE "Visit" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "confirmationSentAt" TIMESTAMP(3),
ADD COLUMN     "lastScanAt" TIMESTAMP(3),
ADD COLUMN     "missedAt" TIMESTAMP(3),
ADD COLUMN     "reminderSentAt" TIMESTAMP(3),
ADD COLUMN     "rescheduleNotes" TEXT,
ADD COLUMN     "rescheduledAt" TIMESTAMP(3),
ADD COLUMN     "rescheduledBy" TEXT;

-- CreateTable
CREATE TABLE "UserNotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "visitReminders" BOOLEAN NOT NULL DEFAULT true,
    "visitConfirmations" BOOLEAN NOT NULL DEFAULT true,
    "discountAlerts" BOOLEAN NOT NULL DEFAULT true,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "reminderLeadTime" INTEGER NOT NULL DEFAULT 24,
    "confirmationLeadTime" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "UserNotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreNotificationPreference" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "newVisitBookings" BOOLEAN NOT NULL DEFAULT true,
    "visitCancellations" BOOLEAN NOT NULL DEFAULT true,
    "visitReminders" BOOLEAN NOT NULL DEFAULT true,
    "lowStockAlerts" BOOLEAN NOT NULL DEFAULT true,
    "systemAlerts" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StoreNotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationPreference_userId_key" ON "UserNotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreNotificationPreference_storeId_key" ON "StoreNotificationPreference"("storeId");

-- CreateIndex
CREATE INDEX "Visit_status_scheduledDate_scheduledTime_idx" ON "Visit"("status", "scheduledDate", "scheduledTime");

-- AddForeignKey
ALTER TABLE "UserNotificationPreference" ADD CONSTRAINT "UserNotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreNotificationPreference" ADD CONSTRAINT "StoreNotificationPreference_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
