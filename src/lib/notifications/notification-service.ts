// src/lib/notifications/notification-service.ts

import { prisma } from '@/lib/prisma';
import { sendNotificationEmail } from '@/lib/email';
import { sendSMS, smsTemplates } from '@/lib/sms';

export class NotificationService {
  
  // Helper function to get full name from user
  private getUserFullName(user: any): string {
    return `${user.firstName} ${user.lastName || ''}`.trim();
  }

  // Send visit reminder (24 hours before)
  async sendVisitReminder(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        user: true,
        store: true,
      },
    });

    if (!visit || visit.status !== 'SCHEDULED') return;

    // Get user preferences
    const preferences = await prisma.userNotificationPreference.findUnique({
      where: { userId: visit.userId },
    });

    // Skip if reminders disabled
    if (!preferences?.visitReminders) return;

    const notificationData = {
      storeName: visit.store.storeName,
      scheduledDate: visit.scheduledDate,
      scheduledTime: visit.scheduledTime,
      storeAddress: `${visit.store.street} ${visit.store.streetNumber}, ${visit.store.city}`,
      numberOfPeople: visit.numberOfPeople,
      visitId: visit.id,
    };

    // Create in-app notification
    if (preferences?.visitReminders) {
      await prisma.notification.create({
        data: {
          userId: visit.userId,
          title: 'Visit Reminder',
          message: `Your visit to ${visit.store.storeName} is tomorrow at ${visit.scheduledTime}`,
          type: 'VISIT_REMINDER',
          data: { visitId: visit.id, storeId: visit.storeId },
          actionUrl: `/visits/${visit.id}`,
        },
      });
    }

    // Send email
    if (preferences?.emailEnabled && visit.user.email) {
      await sendNotificationEmail(
        visit.user.email,
        'Visit Reminder',
        'visit-reminder',
        notificationData
      );
    }

    // Send SMS
    if (preferences?.smsEnabled && visit.user.phoneNumber) {
      await sendSMS(
        `${visit.user.phoneCountry}${visit.user.phoneNumber}`,
        smsTemplates['visit-reminder'](notificationData)
      );
    }

    // Mark reminder as sent
    await prisma.visit.update({
      where: { id: visit.id },
      data: { reminderSentAt: new Date() },
    });
  }

  // Notify store about new visit
  async notifyStoreNewVisit(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        user: true,
        store: { 
          include: { 
            manager: true,
            storeNotificationPreference: true,
          },
        },
      },
    });

    if (!visit) return;

    const preferences = visit.store.storeNotificationPreference;
    if (!preferences?.newVisitBookings) return;

    const customerName = this.getUserFullName(visit.user); // FIXED: use helper function
    
    const notificationData = {
      customerName, // FIXED: changed from visit.user.name
      scheduledDate: visit.scheduledDate,
      scheduledTime: visit.scheduledTime,
      numberOfPeople: visit.numberOfPeople,
      customerNotes: visit.customerNotes,
      visitId: visit.id,
      storeName: visit.store.storeName,
    };

    // Store in-app notification
    if (preferences?.visitReminders) {
      await prisma.storeNotification.create({
        data: {
          storeId: visit.storeId,
          title: 'New Visit Booked',
          message: `${customerName} booked a visit for ${visit.scheduledDate}`, // FIXED
          type: 'NEW_VISIT',
          data: { visitId: visit.id, userId: visit.userId },
          actionUrl: `/dashboard/store/visits/${visit.id}`,
        },
      });
    }

    // Email to store manager
    if (preferences?.emailEnabled && visit.store.manager.email) {
      await sendNotificationEmail(
        visit.store.manager.email,
        'New Visit Booking',
        'store-new-visit',
        notificationData
      );
    }

    // SMS to store manager
    if (preferences?.smsEnabled && visit.store.manager.phoneNumber) {
      await sendSMS(
        `${visit.store.manager.phoneCountry}${visit.store.manager.phoneNumber}`,
        smsTemplates['store-new-visit'](notificationData)
      );
    }
  }

  // Send visit confirmation (1 hour before)
  async sendVisitConfirmation(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        user: true,
        store: true,
        discount: true,
      },
    });

    if (!visit || visit.status !== 'SCHEDULED') return;

    const preferences = await prisma.userNotificationPreference.findUnique({
      where: { userId: visit.userId },
    });

    if (!preferences?.visitConfirmations) return;

    const notificationData = {
      storeName: visit.store.storeName,
      scheduledDate: visit.scheduledDate,
      scheduledTime: visit.scheduledTime,
      storeAddress: `${visit.store.street} ${visit.store.streetNumber}, ${visit.store.city}`,
      discountCode: visit.discount?.code,
      visitId: visit.id,
    };

    // Send email
    if (preferences?.emailEnabled && visit.user.email) {
      await sendNotificationEmail(
        visit.user.email,
        'Visit Confirmation',
        'visit-confirmation',
        notificationData
      );
    }

    // Send SMS
    if (preferences?.smsEnabled && visit.user.phoneNumber) {
      await sendSMS(
        `${visit.user.phoneCountry}${visit.user.phoneNumber}`,
        smsTemplates['visit-confirmation'](notificationData)
      );
    }
  }

  // Send visit cancellation notification
  async sendVisitCancellation(visitId: string, cancelledBy: string, reason?: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        user: true,
        store: true,
      },
    });

    if (!visit) return;

    // Notify customer
    if (cancelledBy === 'STORE') {
      const preferences = await prisma.userNotificationPreference.findUnique({
        where: { userId: visit.userId },
      });

      if (preferences?.emailEnabled && visit.user.email) {
        await sendNotificationEmail(
          visit.user.email,
          'Visit Cancelled',
          'visit-cancelled',
          {
            storeName: visit.store.storeName,
            scheduledDate: visit.scheduledDate,
            scheduledTime: visit.scheduledTime,
            cancellationReason: reason || 'Store request',
          }
        );
      }
    }

    // Notify store (if cancelled by customer)
    if (cancelledBy === 'CUSTOMER') {
      const preferences = await prisma.storeNotificationPreference.findUnique({
        where: { storeId: visit.storeId },
      });

      if (preferences?.visitCancellations && preferences.emailEnabled && visit.store.email) {
        await sendNotificationEmail(
          visit.store.email,
          'Visit Cancelled by Customer',
          'visit-cancelled',
          {
            customerName: this.getUserFullName(visit.user), // FIXED
            scheduledDate: visit.scheduledDate,
            scheduledTime: visit.scheduledTime,
            cancellationReason: reason || 'Customer request',
          }
        );
      }
    }
  }

  // Bulk send reminders for upcoming visits
  async sendScheduledReminders() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find visits happening tomorrow that haven't had reminders sent
    const visits = await prisma.visit.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: {
          gte: tomorrow,
          lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
        },
        reminderSentAt: null,
      },
      include: {
        user: true,
        store: true,
      },
    });

    for (const visit of visits) {
      await this.sendVisitReminder(visit.id);
    }

    // Send confirmations for visits happening in 1 hour
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const confirmVisits = await prisma.visit.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: {
          gte: now,
          lt: oneHourFromNow,
        },
      },
    });

    for (const visit of confirmVisits) {
      await this.sendVisitConfirmation(visit.id);
    }

    return {
      remindersSent: visits.length,
      confirmationsSent: confirmVisits.length,
    };
  }

  // NEW METHODS ADDED FOR MISSED VISITS

  // Send missed visit notification to customer
  async sendMissedVisitNotification(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        user: true,
        store: true,
      },
    });

    if (!visit) return;

    const preferences = await prisma.userNotificationPreference.findUnique({
      where: { userId: visit.userId },
    });

    if (!preferences?.emailEnabled || !visit.user.email) return;

    await sendNotificationEmail(
      visit.user.email,
      'Missed Visit',
      'visit-missed',
      {
        storeName: visit.store.storeName,
        scheduledDate: visit.scheduledDate,
        scheduledTime: visit.scheduledTime,
        visitId: visit.id,
        storeAddress: `${visit.store.street} ${visit.store.streetNumber}, ${visit.store.city}`,
      }
    );

    // Also create in-app notification
    if (preferences?.visitReminders) {
      await prisma.notification.create({
        data: {
          userId: visit.userId,
          title: 'Missed Visit',
          message: `You missed your visit to ${visit.store.storeName}`,
          type: 'VISIT_MISSED',
          data: { visitId: visit.id, storeId: visit.storeId },
          actionUrl: `/visits/${visit.id}`,
        },
      });
    }

    // Send SMS if enabled
    if (preferences?.smsEnabled && visit.user.phoneNumber) {
      await sendSMS(
        `${visit.user.phoneCountry}${visit.user.phoneNumber}`,
        `You missed your visit to ${visit.store.storeName}. Schedule a new visit: ${process.env.NEXTAUTH_URL}/schedule/${visit.storeId}`
      );
    }
  }

  // Send store notification about missed visit
  async sendStoreMissedVisitNotification(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        user: true,
        store: {
          include: {
            manager: true,
            storeNotificationPreference: true,
          },
        },
      },
    });

    if (!visit) return;

    const preferences = visit.store.storeNotificationPreference;
    if (!preferences?.emailEnabled || !visit.store.manager.email) return;

    await sendNotificationEmail(
      visit.store.manager.email,
      'Customer Missed Visit',
      'store-missed-visit',
      {
        customerName: this.getUserFullName(visit.user), // FIXED
        scheduledDate: visit.scheduledDate,
        scheduledTime: visit.scheduledTime,
        visitId: visit.id,
        storeName: visit.store.storeName,
        customerEmail: visit.user.email,
        customerPhone: visit.user.phoneNumber ? 
          `${visit.user.phoneCountry}${visit.user.phoneNumber}` : 'Not provided',
      }
    );

    // Store in-app notification
    if (preferences?.visitReminders) {
      await prisma.storeNotification.create({
        data: {
          storeId: visit.storeId,
          title: 'Customer Missed Visit',
          message: `${this.getUserFullName(visit.user)} missed their scheduled visit`, // FIXED
          type: 'VISIT_MISSED',
          data: { visitId: visit.id, userId: visit.userId },
          actionUrl: `/dashboard/store/visits/${visit.id}`,
        },
      });
    }

    // Send SMS to store manager if enabled
    if (preferences?.smsEnabled && visit.store.manager.phoneNumber) {
      await sendSMS(
        `${visit.store.manager.phoneCountry}${visit.store.manager.phoneNumber}`,
        `Customer ${this.getUserFullName(visit.user)} missed their visit at ${visit.scheduledTime}. View: ${process.env.NEXTAUTH_URL}/dashboard/store/visits` // FIXED
      );
    }
  }

  // Send reminder for recently missed visit
  async sendMissedVisitReminder(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        user: true,
        store: true,
      },
    });

    if (!visit) return;

    const preferences = await prisma.userNotificationPreference.findUnique({
      where: { userId: visit.userId },
    });

    if (!preferences?.emailEnabled || !visit.user.email) return;

    await sendNotificationEmail(
      visit.user.email,
      'You Missed Your Visit',
      'visit-missed-reminder',
      {
        storeName: visit.store.storeName,
        scheduledDate: visit.scheduledDate,
        scheduledTime: visit.scheduledTime,
        visitId: visit.id,
        storeAddress: `${visit.store.street} ${visit.store.streetNumber}, ${visit.store.city}`,
        storePhone: visit.store.phoneNumber ? 
          `${visit.store.phoneCountry}${visit.store.phoneNumber}` : null,
      }
    );

    // Send SMS if enabled
    if (preferences?.smsEnabled && visit.user.phoneNumber) {
      await sendSMS(
        `${visit.user.phoneCountry}${visit.user.phoneNumber}`,
        `You missed your visit to ${visit.store.storeName}. Contact store: ${visit.store.phoneNumber}`
      );
    }
  }

  // Send discount notification when visit is completed
  async sendDiscountNotification(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        user: true,
        store: true,
        discount: true,
      },
    });

    if (!visit || !visit.discount || !visit.discountUnlocked) return;

    const preferences = await prisma.userNotificationPreference.findUnique({
      where: { userId: visit.userId },
    });

    if (!preferences?.discountAlerts || !visit.user.email) return;

    await sendNotificationEmail(
      visit.user.email,
      'Your Discount is Ready!',
      'discount-available',
      {
        storeName: visit.store.storeName,
        discountCode: visit.discount.code,
        discountAmount: visit.discount.discountAmount || visit.discount.discountPercent,
        discountType: visit.discount.type,
        validTo: visit.discount.validTo,
        visitId: visit.id,
      }
    );

    // Create in-app notification
    if (preferences?.visitReminders) {
      await prisma.notification.create({
        data: {
          userId: visit.userId,
          title: 'Discount Unlocked!',
          message: `You earned a discount at ${visit.store.storeName}`,
          type: 'DISCOUNT_AVAILABLE',
          data: { 
            visitId: visit.id, 
            storeId: visit.storeId,
            discountCode: visit.discount.code 
          },
          actionUrl: `/visits/${visit.id}`,
        },
      });
    }
  }

  // Send visit completed notification
  async sendVisitCompletedNotification(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        user: true,
        store: true,
      },
    });

    if (!visit) return;

    // Notify customer
    const userPreferences = await prisma.userNotificationPreference.findUnique({
      where: { userId: visit.userId },
    });

    if (userPreferences?.emailEnabled && visit.user.email) {
      await sendNotificationEmail(
        visit.user.email,
        'Visit Completed',
        'visit-completed',
        {
          storeName: visit.store.storeName,
          visitDate: visit.scheduledDate,
          visitTime: visit.scheduledTime,
          visitId: visit.id,
          storeAddress: `${visit.store.street} ${visit.store.streetNumber}, ${visit.store.city}`,
        }
      );
    }

    // Notify store
    const storePreferences = await prisma.storeNotificationPreference.findUnique({
      where: { storeId: visit.storeId },
    });

    if (storePreferences?.emailEnabled && visit.store.email) {
      await sendNotificationEmail(
        visit.store.email,
        'Visit Completed',
        'store-visit-completed',
        {
          customerName: this.getUserFullName(visit.user), // FIXED
          visitDate: visit.scheduledDate,
          visitTime: visit.scheduledTime,
          visitId: visit.id,
          numberOfPeople: visit.numberOfPeople,
          customerNotes: visit.customerNotes,
        }
      );
    }
  }

  // Send review reminder after completed visit
  async sendReviewReminder(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        user: true,
        store: true,
        review: true, // Check if review already exists
      },
    });

    // Don't send if review already exists or visit wasn't completed
    if (!visit || visit.status !== 'COMPLETED' || visit.review) return;

    const preferences = await prisma.userNotificationPreference.findUnique({
      where: { userId: visit.userId },
    });

    if (!preferences?.emailEnabled || !visit.user.email) return;

    // Wait 24 hours after visit completion before sending review reminder
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (visit.completedAt && visit.completedAt > twentyFourHoursAgo) {
      // Too soon, skip
      return;
    }

    await sendNotificationEmail(
      visit.user.email,
      'How was your visit?',
      'review-reminder',
      {
        storeName: visit.store.storeName,
        visitDate: visit.scheduledDate,
        visitId: visit.id,
        storeId: visit.storeId,
      }
    );
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit: number = 20) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Get store notifications
  async getStoreNotifications(storeId: string, limit: number = 20) {
    return await prisma.storeNotification.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string, userId: string) {
    return await prisma.notification.update({
      where: { 
        id: notificationId,
        userId, // Ensure user owns the notification
      },
      data: { isRead: true },
    });
  }

  // Mark store notification as read
  async markStoreNotificationAsRead(notificationId: string, storeId: string) {
    return await prisma.storeNotification.update({
      where: { 
        id: notificationId,
        storeId, // Ensure store owns the notification
      },
      data: { isRead: true },
    });
  }

  // Get unread notification count for user
  async getUnreadNotificationCount(userId: string) {
    return await prisma.notification.count({
      where: { 
        userId,
        isRead: false,
      },
    });
  }

  // Get unread notification count for store
  async getStoreUnreadNotificationCount(storeId: string) {
    return await prisma.storeNotification.count({
      where: { 
        storeId,
        isRead: false,
      },
    });
  }
}

// Create a singleton instance for easy import
export const notificationService = new NotificationService();