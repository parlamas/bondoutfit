// src/app/api/visits/[id]/route.ts - COMPLETELY FIXED

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get visit details
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
            email: true,
          }
        },
        store: {
          select: {
            id: true,
            storeName: true,
            street: true,
            streetNumber: true,
            city: true,
            country: true,
            openingHours: true,
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

    // Verify the user owns this visit OR is store manager
    const userId = (session.user as any).id;
    const isCustomerOwner = visit.userId === userId;
    const isStoreManager = visit.store.manager?.id === userId;

    if (!isCustomerOwner && !isStoreManager) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json(visit);

  } catch (error) {
    console.error('Error fetching visit:', error);
    return NextResponse.json({ error: 'Failed to fetch visit' }, { status: 500 });
  }
}

// PATCH - Edit visit
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const visitId = params.id;
    const updates = await request.json();

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

    // Verify the user owns this visit
    const userId = (session.user as any).id;
    if (visit.userId !== userId) {
      return NextResponse.json({ error: 'Not authorized to edit this visit' }, { status: 403 });
    }

    // Check if visit can be edited
    if (visit.status !== 'SCHEDULED') {
      return NextResponse.json({ 
        error: `Cannot edit a visit that is ${visit.status.toLowerCase()}`,
        currentStatus: visit.status,
        allowedStatuses: ['SCHEDULED']
      }, { status: 400 });
    }

    if (visit.checkedIn) {
      return NextResponse.json({ 
        error: 'Cannot edit a visit that has already been checked in',
        checkedInAt: visit.checkedInAt,
      }, { status: 400 });
    }

    // Check if it's too close to scheduled time to edit (e.g., within 2 hours)
    const now = new Date();
    const scheduledDateTime = new Date(visit.scheduledDate);
    const [hours, minutes] = visit.scheduledTime.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    const timeDiff = scheduledDateTime.getTime() - now.getTime();
    const hoursUntilVisit = timeDiff / (1000 * 60 * 60);

    if (hoursUntilVisit < 2) {
      return NextResponse.json({ 
        error: 'Cannot edit within 2 hours of scheduled visit time',
        hoursUntilVisit: hoursUntilVisit.toFixed(1),
        minHoursRequired: 2,
        scheduledTime: visit.scheduledTime,
        currentTime: now.toLocaleTimeString(),
      }, { status: 400 });
    }

    // Validate updates
    const allowedUpdates = ['scheduledDate', 'scheduledTime', 'numberOfPeople', 'customerNotes', 'specialRequests'];
    const invalidUpdates = Object.keys(updates).filter(key => !allowedUpdates.includes(key));
    
    if (invalidUpdates.length > 0) {
      return NextResponse.json({ 
        error: `Cannot update fields: ${invalidUpdates.join(', ')}`,
        allowedFields: allowedUpdates
      }, { status: 400 });
    }

    // Convert date string to DateTime for scheduledDate
    const updateData: any = { ...updates };
    if (updates.scheduledDate) {
      // Convert YYYY-MM-DD to DateTime
      updateData.scheduledDate = new Date(updates.scheduledDate);
    }

    // Validate time format (HH:MM)
    if (updates.scheduledTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(updates.scheduledTime)) {
        return NextResponse.json({ 
          error: 'Invalid time format. Use HH:MM (24-hour)',
          received: updates.scheduledTime,
          example: '14:30'
        }, { status: 400 });
      }
    }

    // Validate number of people
    if (updates.numberOfPeople) {
      const numPeople = parseInt(updates.numberOfPeople);
      if (isNaN(numPeople) || numPeople < 1 || numPeople > 20) {
        return NextResponse.json({ 
          error: 'Number of people must be between 1 and 20',
          received: updates.numberOfPeople,
        }, { status: 400 });
      }
    }

    // Update the visit
    const updatedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: updateData,
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

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: userId,
        storeId: visit.storeId,
        action: 'VISIT_EDITED',
        entity: 'Visit',
        entityId: visitId,
        changes: {
          previous: {
            scheduledDate: visit.scheduledDate,
            scheduledTime: visit.scheduledTime,
            numberOfPeople: visit.numberOfPeople,
            customerNotes: visit.customerNotes,
            specialRequests: visit.specialRequests,
          },
          updated: updates,
          hoursUntilOriginalVisit: hoursUntilVisit.toFixed(1),
        },
      },
    });

    // TODO: Send notification to store about schedule change

    console.log(`✏️ Visit ${visitId} edited by customer. Changes:`, updates);

    return NextResponse.json({
      success: true,
      message: 'Visit updated successfully',
      visit: updatedVisit,
      changes: updates,
    });

  } catch (error) {
    console.error('Error editing visit:', error);
    return NextResponse.json(
      { error: 'Failed to edit visit', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST endpoint to check edit eligibility
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

    // Check edit eligibility
    const now = new Date();
    const scheduledDateTime = new Date(visit.scheduledDate);
    const [hours, minutes] = visit.scheduledTime.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    const timeDiff = scheduledDateTime.getTime() - now.getTime();
    const hoursUntilVisit = timeDiff / (1000 * 60 * 60);

    const canEdit = 
      visit.status === 'SCHEDULED' && 
      !visit.checkedIn && 
      hoursUntilVisit >= 2;

    return NextResponse.json({
      canEdit,
      reasons: canEdit ? [
        'Change of plans',
        'Scheduling conflict',
        'Found alternative',
        'Other reasons'
      ] : [],
      requirements: {
        status: visit.status,
        checkedIn: visit.checkedIn,
        hoursUntilVisit: hoursUntilVisit.toFixed(1),
        minHoursRequired: 2,
      },
      visit: {
        id: visit.id,
        status: visit.status,
        scheduledDate: visit.scheduledDate,
        scheduledTime: visit.scheduledTime,
        numberOfPeople: visit.numberOfPeople,
        customerNotes: visit.customerNotes,
        specialRequests: visit.specialRequests,
        user: visit.user,
      },
      storeHours: 'Check store hours for available time slots',
    });

  } catch (error) {
    console.error('Error checking edit eligibility:', error);
    return NextResponse.json({ error: 'Failed to check edit eligibility' }, { status: 500 });
  }
}