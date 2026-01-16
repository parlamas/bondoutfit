//app/api/visits/[id]/check-in/route.ts

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
    
    // Only store managers can check in customers
    if (!session || session.user?.role !== 'STORE_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const visitId = params.id;
    
    // Find the visit
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        store: true,
        discount: true,
      },
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    // Check if visit belongs to the store manager's store
    if (visit.store.managerId !== session.user.id) {
      return NextResponse.json({ error: 'Not your store' }, { status: 403 });
    }

    // Check if visit is already checked in
    if (visit.checkedIn) {
      return NextResponse.json({ 
        error: 'Already checked in',
        checkedInAt: visit.checkedInAt,
      }, { status: 400 });
    }

    // Check if visit is scheduled
    if (visit.status !== 'SCHEDULED') {
      return NextResponse.json({ 
        error: `Visit is ${visit.status.toLowerCase()}, cannot check in`,
      }, { status: 400 });
    }

    // Check if visit time is valid (not too early/late)
    const scheduledDateTime = new Date(`${visit.scheduledDate}T${visit.scheduledTime}`);
    const currentTime = new Date();
    const hoursDifference = Math.abs(currentTime.getTime() - scheduledDateTime.getTime()) / (1000 * 60 * 60);

    // Allow check-in within 2 hours before/after scheduled time
    if (hoursDifference > 2) {
      return NextResponse.json({ 
        error: 'Too early or too late to check in',
        scheduledTime: visit.scheduledTime,
        currentTime: currentTime.toISOString(),
      }, { status: 400 });
    }

    // Update the visit
    const updatedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: {
        checkedIn: true,
        checkedInAt: currentTime,
        status: 'COMPLETED',
        completedAt: currentTime,
      },
      include: {
        store: {
          select: {
            id: true,
            storeName: true,
          },
        },
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

    // Unlock discount if available and not already unlocked
    let discountUnlocked = false;
    let discountCode = null;

    if (visit.discountId && !visit.discountUnlocked) {
      // Generate a unique discount code
      discountCode = `DISC-${visitId.slice(0, 8).toUpperCase()}`;
      
      await prisma.visit.update({
        where: { id: visitId },
        data: {
          discountUnlocked: true,
          discountCode: discountCode,
        },
      });

      discountUnlocked = true;
    }

    return NextResponse.json({
      success: true,
      message: 'Customer checked in successfully',
      visit: {
        id: updatedVisit.id,
        customerName: updatedVisit.user.firstName + (updatedVisit.user.lastName ? ' ' + updatedVisit.user.lastName : ''),
        customerEmail: updatedVisit.user.email,
        storeName: updatedVisit.store.storeName,
        scheduledDate: updatedVisit.scheduledDate,
        scheduledTime: updatedVisit.scheduledTime,
        numberOfPeople: updatedVisit.numberOfPeople,
        checkedInAt: updatedVisit.checkedInAt,
        discountUnlocked,
        discountCode,
      },
    });

  } catch (error) {
    console.error('Check-in error:', error);
    const err = error as Error;
    return NextResponse.json(
      { error: 'Failed to check in', details: err.message },
      { status: 500 }
    );
  }
}