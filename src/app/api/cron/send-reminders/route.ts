// src/app/api/cron/send-reminders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications/notification-service';

export async function GET(request: NextRequest) {
  // Verify it's called by cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notificationService = new NotificationService();
    const results = await notificationService.sendScheduledReminders();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders', details: error },
      { status: 500 }
    );
  }
}
