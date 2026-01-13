//src/app/api/store/visits/[id]/reschedule/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const visitId = params.id;
    const { newDate, newTime, notes, rescheduledBy } = await request.json();

    if (!newDate || !newTime) {
      return NextResponse.json(
        { error: 'New date and time are required' },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { managerId: (session.user as any).id },
      select: { id: true },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found for manager' },
        { status: 404 }
      );
    }

    const visit = await prisma.visit.findFirst({
      where: {
        id: visitId,
        storeId: store.id,
        status: 'SCHEDULED',
      },
    });

    if (!visit) {
      return NextResponse.json(
        { error: 'Visit not found or not authorized' },
        { status: 404 }
      );
    }

    const updatedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: {
        scheduledDate: new Date(newDate),
        scheduledTime: newTime,
        rescheduledAt: new Date(),
        rescheduledBy,
        rescheduleNotes: notes,
        status: 'SCHEDULED',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Visit rescheduled successfully',
      visit: updatedVisit,
    });

  } catch (error) {
    console.error('Error rescheduling visit:', error);
    return NextResponse.json(
      { error: 'Failed to reschedule visit', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}