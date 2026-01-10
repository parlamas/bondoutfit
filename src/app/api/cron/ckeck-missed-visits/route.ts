//src/app/api/cron/check-missed-visits/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // This would be called by a cron job (Vercel Cron, etc.)
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 120 * 60 * 1000);

    // Find visits that were scheduled for more than 2 hours ago
    // and haven't been checked in
    const missedVisits = await prisma.visit.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: { lt: twoHoursAgo },
        checkedIn: false,
      },
    });

    // Mark them as missed
    const updatePromises = missedVisits.map(visit =>
      prisma.visit.update({
        where: { id: visit.id },
        data: {
          status: 'MISSED',
          missedAt: now,
        },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      missedCount: missedVisits.length,
      updatedVisits: missedVisits.map(v => v.id),
    });
  } catch (error) {
    console.error('Missed visits check error:', error);
    return NextResponse.json(
      { error: 'Failed to check missed visits' },
      { status: 500 }
    );
  }
}