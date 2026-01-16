// src/app/api/visits/[id]/cancel/route.ts - UPDATED TO MATCH YOUR SCHEMA

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
    const { reason } = await request.json();

    // Get the visit
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        store: {
          select: {
            id: true,
            storeName: true,
            manager: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
      },
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    // Verify the user owns this visit OR is the store manager
    const userId = (session.user as any).id;
    const isCustomerOwner = visit.userId === userId;
    const isStoreManager = visit.store.manager?.id === userId;

    if (!isCustomerOwner && !isStoreManager) {
      return NextResponse.json({ error: 'Not authorized to cancel this visit' }, { status: 403 });
    }

    // Check if visit can be cancelled
    if (visit.status !== 'SCHEDULED') {
      return NextResponse.json({ 
        error: `Cannot cancel a visit that is ${visit.status.toLowerCase()}`,
        currentStatus: visit.status,
        allowedStatuses: ['SCHEDULED']
      }, { status: 400 });
    }

    if (visit.checkedIn) {
      return NextResponse.json({ 
        error: 'Cannot cancel a visit that has already been checked in',
        checkedInAt: visit.checkedInAt,
      }, { status: 400 });
    }

    // Calculate if it's too late to cancel (e.g., within 1 hour of scheduled time)
    const now = new Date();
    const scheduledDateTime = new Date(visit.scheduledDate);
    const [hours, minutes] = visit.scheduledTime.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    const timeDiff = scheduledDateTime.getTime() - now.getTime();
    const hoursUntilVisit = timeDiff / (1000 * 60 * 60);

    if (hoursUntilVisit < 1) {
      return NextResponse.json({ 
        error: 'Cannot cancel within 1 hour of scheduled visit time',
        hoursUntilVisit: hoursUntilVisit.toFixed(1),
        scheduledTime: visit.scheduledTime,
        currentTime: now.toLocaleTimeString(),
      }, { status: 400 });
    }

    // Update the visit status - using your schema fields
    const updatedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'CANCELLED',
        cancelledAt: now,
        cancelledBy: isCustomerOwner ? 'CUSTOMER' : 'STORE',
        cancellationReason: reason || (isCustomerOwner ? 'Cancelled by customer' : 'Cancelled by store manager'),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        store: {
          select: {
          storeName: true,
          }
        },
      },
    });

    // Create an audit log instead of visitLog (since you have AuditLog model)
    await prisma.auditLog.create({
      data: {
        userId: userId,
        storeId: visit.storeId,
        action: 'VISIT_CANCELLED',
        entity: 'Visit',
        entityId: visitId,
        changes: {
          previousStatus: visit.status,
          newStatus: 'CANCELLED',
          cancelledBy: isCustomerOwner ? 'CUSTOMER' : 'STORE',
          reason: reason || 'No reason provided',
          hoursUntilVisit: hoursUntilVisit.toFixed(1),
          scheduledDate: visit.scheduledDate.toISOString(),
          scheduledTime: visit.scheduledTime,
        },
      },
    });

    // TODO: Send notifications
    // - Email to store manager if customer cancelled
    // - Email to customer if store manager cancelled
    // - In-app notifications

    console.log(`📝 Visit ${visitId} cancelled by ${isCustomerOwner ? 'customer' : 'manager'}. Reason: ${reason || 'No reason'}`);

    return NextResponse.json({
      success: true,
      message: 'Visit cancelled successfully',
      cancelledBy: isCustomerOwner ? 'customer' : 'manager',
      visit: {
        id: updatedVisit.id,
        status: updatedVisit.status,
        cancelledAt: updatedVisit.cancelledAt,
        cancellationReason: updatedVisit.cancellationReason,
        scheduledDate: updatedVisit.scheduledDate,
        scheduledTime: updatedVisit.scheduledTime,
        user: updatedVisit.user,
        store: updatedVisit.store,
      },
      refundPolicy: 'Cancellations made more than 1 hour before the visit may be eligible for a full refund.',
    });

  } catch (error) {
    console.error('Error cancelling visit:', error);
    return NextResponse.json(
      { error: 'Failed to cancel visit', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if visit can be cancelled
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const visitId = params.id;
    
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
      },
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    // Verify the user owns this visit
    const userId = (session.user as any).id;
    if (visit.userId !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Check cancellation eligibility
    const now = new Date();
    const scheduledDateTime = new Date(visit.scheduledDate);
    const [hours, minutes] = visit.scheduledTime.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    const timeDiff = scheduledDateTime.getTime() - now.getTime();
    const hoursUntilVisit = timeDiff / (1000 * 60 * 60);

    const canCancel = 
      visit.status === 'SCHEDULED' && 
      !visit.checkedIn && 
      hoursUntilVisit >= 1;

    return NextResponse.json({
      canCancel,
      reasons: canCancel ? [
        'Change of plans',
        'Scheduling conflict',
        'Found alternative',
        'Other reasons'
      ] : [],
      requirements: {
        status: visit.status,
        checkedIn: visit.checkedIn,
        hoursUntilVisit: hoursUntilVisit.toFixed(1),
        minHoursRequired: 1,
      },
      visit: {
        id: visit.id,
        status: visit.status,
        scheduledDate: visit.scheduledDate,
        scheduledTime: visit.scheduledTime,
        user: visit.user,
      },
      currentTime: now.toISOString(),
    });

  } catch (error) {
    console.error('Error checking cancellation:', error);
    return NextResponse.json({ error: 'Failed to check cancellation' }, { status: 500 });
  }
}