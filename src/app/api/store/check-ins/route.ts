//app/api/store/check-ins/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'STORE_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get store managed by this manager
    const store = await prisma.store.findUnique({
      where: { managerId: session.user.id },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get recent check-ins for this store (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const checkIns = await prisma.visit.findMany({
      where: {
        storeId: store.id,
        checkedIn: true,
        checkedInAt: {
          gte: yesterday,
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        checkedInAt: 'desc',
      },
      take: 10,
    });

    const formattedCheckIns = checkIns.map(visit => ({
      id: visit.id,
      customerName: visit.user.firstName + (visit.user.lastName ? ' ' + visit.user.lastName : ''),
      customerEmail: visit.user.email,
      checkedInAt: visit.checkedInAt,
      scheduledDate: visit.scheduledDate,
      scheduledTime: visit.scheduledTime,
      discountUnlocked: visit.discountUnlocked,
      discountCode: visit.discountCode,
    }));

    return NextResponse.json({
      checkIns: formattedCheckIns,
      total: checkIns.length,
    });

  } catch (error) {
    console.error('Get check-ins error:', error);
    const err = error as Error;
    return NextResponse.json(
      { error: 'Failed to get check-ins', details: err.message },
      { status: 500 }
    );
  }
}