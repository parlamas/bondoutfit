// src/app/api/store/visits/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'STORE_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get store ID for the current manager
    const store = await prisma.store.findUnique({
      where: { managerId: (session.user as any).id },
      select: { id: true },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const visits = await prisma.visit.findMany({
      where: { storeId: store.id },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' },
      ],
      include: {
  user: {
    select: {
      name: true,
      email: true,
      gender: true,      // ADD
      age: true,         // ADD
      heightCm: true,    // ADD
      weightKg: true,    // ADD
    },
  },
},
    });

    return NextResponse.json(visits.map(visit => ({
      id: visit.id,
      scheduledDate: visit.scheduledDate.toISOString(),
      scheduledTime: visit.scheduledTime,
      numberOfPeople: visit.numberOfPeople,
      status: visit.status,
      checkedIn: visit.checkedIn,
      checkedInAt: visit.checkedInAt?.toISOString() || null,
      customerNotes: visit.customerNotes,
      discountUnlocked: visit.discountUnlocked,
      discountUsed: visit.discountUsed,
      user: visit.user,
    })));
  } catch (error) {
    console.error('Error fetching store visits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visits' },
      { status: 500 }
    );
  }
}
