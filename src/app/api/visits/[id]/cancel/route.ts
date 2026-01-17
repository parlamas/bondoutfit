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

        // Send email notification to store manager
    if (isCustomerOwner) {
      try {
        // Assuming you have an email service utility
        const { sendEmail } = await import('@/lib/email-service');
        
        await sendEmail({
          to: visit.store.manager?.email, // Store manager email
          subject: `Visit Cancelled - ${visit.store.storeName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Visit Cancellation Notification</h2>
              <p>A customer has cancelled their scheduled visit:</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">Visit Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li style="margin-bottom: 8px;"><strong>Customer:</strong> ${visit.user.firstName} ${visit.user.lastName}</li>
                  <li style="margin-bottom: 8px;"><strong>Email:</strong> ${visit.user.email}</li>
                  <li style="margin-bottom: 8px;"><strong>Scheduled Date:</strong> ${new Date(visit.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                  <li style="margin-bottom: 8px;"><strong>Time:</strong> ${visit.scheduledTime}</li>
                  <li style="margin-bottom: 8px;"><strong>Number of People:</strong> ${visit.numberOfPeople}</li>
                  <li style="margin-bottom: 8px;"><strong>Cancellation Reason:</strong> ${reason || 'No reason provided'}</li>
                  <li style="margin-bottom: 8px;"><strong>Cancelled At:</strong> ${now.toLocaleString()}</li>
                </ul>
              </div>
              
              <p style="color: #64748b; font-size: 14px;">This cancellation has been recorded in your store dashboard.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
                <p>You can view all your visits in the store dashboard.</p>
              </div>
            </div>
          `,
          text: `
            Visit Cancellation Notification
            
            A customer has cancelled their scheduled visit:
            
            Customer: ${visit.user.firstName} ${visit.user.lastName}
            Email: ${visit.user.email}
            Scheduled Date: ${new Date(visit.scheduledDate).toLocaleDateString()}
            Time: ${visit.scheduledTime}
            Number of People: ${visit.numberOfPeople}
            Cancellation Reason: ${reason || 'No reason provided'}
            Cancelled At: ${now.toLocaleString()}
            
            This cancellation has been recorded in your store dashboard.
            
            You can view all your visits in the store dashboard.
          `
        });
        
        console.log(`📧 Cancellation email sent to store manager: ${visit.store.manager?.email}`);
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Send email to customer if store manager cancelled
    if (!isCustomerOwner) {
      try {
        const { sendEmail } = await import('@/lib/email-service');
        
        await sendEmail({
          to: visit.user.email,
          subject: `Your visit to ${visit.store.storeName} has been cancelled`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Visit Cancelled</h2>
              <p>Your scheduled visit has been cancelled by the store.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">Visit Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li style="margin-bottom: 8px;"><strong>Store:</strong> ${visit.store.storeName}</li>
                  <li style="margin-bottom: 8px;"><strong>Scheduled Date:</strong> ${new Date(visit.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                  <li style="margin-bottom: 8px;"><strong>Time:</strong> ${visit.scheduledTime}</li>
                  <li style="margin-bottom: 8px;"><strong>Number of People:</strong> ${visit.numberOfPeople}</li>
                  <li style="margin-bottom: 8px;"><strong>Cancellation Reason:</strong> ${reason || 'Cancelled by store manager'}</li>
                  <li style="margin-bottom: 8px;"><strong>Cancelled At:</strong> ${now.toLocaleString()}</li>
                </ul>
              </div>
              
              <p>If you have any questions, please contact the store directly.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
                <p>You can view all your visits in your customer dashboard.</p>
              </div>
            </div>
          `
        });
        
        console.log(`📧 Cancellation email sent to customer: ${visit.user.email}`);
      } catch (emailError) {
        console.error('Failed to send customer cancellation email:', emailError);
      }
    }

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