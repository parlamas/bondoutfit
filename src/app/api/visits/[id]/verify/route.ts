//app/api/visits/[id]/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'STORE_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const visitId = params.id;
    
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        store: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    // Check if visit belongs to the store manager's store
    if (visit.store.managerId !== session.user.id) {
      return NextResponse.json({ error: 'Not your store' }, { status: 403 });
    }

    return NextResponse.json({
      visit: {
        id: visit.id,
        customerName: visit.user.firstName + (visit.user.lastName ? ' ' + visit.user.lastName : ''),
        customerEmail: visit.user.email,
        storeName: visit.store.storeName,
        scheduledDate: visit.scheduledDate,
        scheduledTime: visit.scheduledTime,
        numberOfPeople: visit.numberOfPeople,
        checkedIn: visit.checkedIn,
        checkedInAt: visit.checkedInAt,
        status: visit.status,
        discountUnlocked: visit.discountUnlocked,
        discountCode: visit.discountCode,
      },
    });

  } catch (error) {
    console.error('Verify visit error:', error);
    const err = error as Error;
    return NextResponse.json(
      { error: 'Failed to verify visit', details: err.message },
      { status: 500 }
    );
  }
}