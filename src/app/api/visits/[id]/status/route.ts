// src/app/api/store/visits/[id]/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isDemoUser } from '@/lib/demo';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== 'STORE_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const visitId = params.id;
    const { status, checkedIn, checkedInAt, completedAt } = await request.json();

    // Get the store for the current manager
    const store = await prisma.store.findUnique({
      where: { managerId: (session.user as any).id },
      select: { id: true },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found for manager' }, { status: 404 });
    }

    // Verify this visit belongs to the manager's store
    const visit = await prisma.visit.findFirst({
      where: {
        id: visitId,
        storeId: store.id,
      },
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found or not authorized' }, { status: 404 });
    }

    // Demo accounts: simulate a successful status update without writing to the database
    if (isDemoUser(session)) {
      return NextResponse.json({
        success: true,
        message: 'Visit status updated',
        visit: {
          id: visit.id,
          status: status || visit.status,
          checkedIn: checkedIn !== undefined ? checkedIn : visit.checkedIn,
          checkedInAt: checkedInAt !== undefined ? checkedInAt : visit.checkedInAt,
          completedAt: completedAt !== undefined ? completedAt : visit.completedAt,
          user: { firstName: '', lastName: '', email: '' },
        },
      });
    }

    // Update the visit
    const updatedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: {
        status: status || visit.status,
        checkedIn: checkedIn !== undefined ? checkedIn : visit.checkedIn,
        checkedInAt: checkedInAt !== undefined ? checkedInAt : visit.checkedInAt,
        completedAt: completedAt !== undefined ? completedAt : visit.completedAt,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Visit status updated',
      visit: {
        id: updatedVisit.id,
        status: updatedVisit.status,
        checkedIn: updatedVisit.checkedIn,
        checkedInAt: updatedVisit.checkedInAt,
        completedAt: updatedVisit.completedAt,
        user: updatedVisit.user,
      },
    });

  } catch (error) {
    console.error('Error updating visit status:', error);
    return NextResponse.json(
      { error: 'Failed to update visit status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}