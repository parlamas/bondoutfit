// src/app/api/cron/check-missed-visits/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/notifications/notification-service';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret if provided (optional security)
    const authHeader = req.headers.get('authorization');
    if (authHeader && process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const now = new Date();
    
    // Strategy: Check visits in multiple time windows
    
    // 1. Visits scheduled for more than 2 hours ago (definitely missed)
    const twoHoursAgo = new Date(now.getTime() - 120 * 60 * 1000);
    
    // 2. Visits that started but not checked in (30 minutes grace period)
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    // Find visits that are definitely missed (> 2 hours)
    const definitelyMissedVisits = await prisma.visit.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: { lt: twoHoursAgo },
        checkedIn: false,
        cancelledAt: null,
      },
      include: {
        user: true,
        store: {
          include: {
            manager: true,
          },
        },
      },
    });

    // Find visits that just missed their slot (30 min - 2 hours ago)
    const recentlyMissedVisits = await prisma.visit.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: {
          lt: twoHoursAgo,
          gte: thirtyMinutesAgo,
        },
        checkedIn: false,
        cancelledAt: null,
      },
      include: {
        user: true,
        store: true,
      },
    });

    const notificationService = new NotificationService();
    
    // Process definitely missed visits
    const definitelyMissedUpdates = [];
    for (const visit of definitelyMissedVisits) {
      definitelyMissedUpdates.push(
        prisma.visit.update({
          where: { id: visit.id },
          data: {
            status: 'MISSED',
            missedAt: now,
          },
        })
      );

      // Send notification to customer about missed visit
      const userPrefs = await prisma.userNotificationPreference.findUnique({
        where: { userId: visit.userId },
      });

      if (userPrefs?.emailEnabled && visit.user.email) {
        // Send missed visit email
        await notificationService.sendMissedVisitNotification(visit.id);
      }

      // Send notification to store manager
      const storePrefs = await prisma.storeNotificationPreference.findUnique({
        where: { storeId: visit.storeId },
      });

      if (storePrefs?.emailEnabled && visit.store.manager.email) {
        // Send store missed visit notification
        await notificationService.sendStoreMissedVisitNotification(visit.id);
      }
    }

    // Process recently missed visits (send reminders)
    const recentlyMissedUpdates: Promise<any>[] = [];
    for (const visit of recentlyMissedVisits) {
      // Check if we should send a "you missed it" notification
      // Only send if no previous missed notification
      const hasMissedNotification = await prisma.notification.findFirst({
        where: {
          userId: visit.userId,
          type: 'VISIT_MISSED',
          data: {
            path: ['visitId'],
            equals: visit.id,
          },
        },
      });

      if (!hasMissedNotification) {
        const userPrefs = await prisma.userNotificationPreference.findUnique({
          where: { userId: visit.userId },
        });

        if (userPrefs?.emailEnabled && visit.user.email) {
          // Send missed visit reminder (can still check in?)
          await notificationService.sendMissedVisitReminder(visit.id);
        }
      }
    }

    // Execute all updates
    const [definitelyUpdated, recentlyUpdated] = await Promise.all([
      Promise.all(definitelyMissedUpdates),
      Promise.all(recentlyMissedUpdates),
    ]);

    // Also check for visits that should be marked as completed
    // Find visits that were checked in but not marked completed
    const completedVisits = await prisma.visit.findMany({
      where: {
        status: 'SCHEDULED',
        checkedIn: true,
        checkedInAt: {
          lt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        },
        completedAt: null,
      },
    });

    const completedUpdates = completedVisits.map(visit =>
      prisma.visit.update({
        where: { id: visit.id },
        data: {
          status: 'COMPLETED',
          completedAt: now,
        },
      })
    );

    await Promise.all(completedUpdates);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      stats: {
        definitelyMissed: definitelyMissedVisits.length,
        recentlyMissed: recentlyMissedVisits.length,
        autoCompleted: completedVisits.length,
      },
      definitelyMissedIds: definitelyMissedVisits.map(v => v.id),
      recentlyMissedIds: recentlyMissedVisits.map(v => v.id),
      completedIds: completedVisits.map(v => v.id),
    });
  } catch (error) {
    console.error('Missed visits check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check missed visits',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}