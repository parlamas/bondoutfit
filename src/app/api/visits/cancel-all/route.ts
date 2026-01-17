// /app/api/visits/cancel-all/route.ts - FIXED VERSION

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function to send emails (you'll need to implement based on your email provider)
async function sendEmail(to: string, subject: string, html: string) {
  // Implementation depends on your email service (Resend, SendGrid, Nodemailer, etc.)
  // For now, we'll log and return a placeholder
  console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
  console.log(`[EMAIL HTML] ${html.substring(0, 200)}...`);
  
  // Example with Resend (uncomment and configure if using Resend):
  /*
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  const { data, error } = await resend.emails.send({
    from: 'Bookings <notifications@your-domain.com>',
    to: [to],
    subject: subject,
    html: html,
  });

  if (error) {
    console.error('Error sending email:', error);
    throw error;
  }

  return data;
  */
  
  return { success: true, message: 'Email would be sent' };
}

// Manager notification email template - FIXED: Added id properties
async function sendManagerCancellationNotification(data: {
  manager: {
    id: string; // ADDED: manager id
    email: string;
    firstName: string;
    lastName: string;
  };
  store: {
    id: string; // ADDED: store id  
    storeName: string;
  };
  cancelledVisits: Array<{
    id: string;
    scheduledDate: Date;
    scheduledTime: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  reason?: string;
}) {
  const { manager, store, cancelledVisits, reason } = data;
  
  const emailContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Visit Cancellation Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Visit Cancellation Notification</h1>
          </div>
          
          <div style="background-color: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="margin-bottom: 20px;">Hello ${manager.firstName},</p>
            
            <p style="margin-bottom: 20px;">
              A customer has cancelled <strong>${cancelledVisits.length} visit(s)</strong> to your store <strong>${store.storeName}</strong>.
            </p>
            
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #111827; margin-top: 0; margin-bottom: 15px;">Cancelled Visit Details</h3>
              
              ${cancelledVisits.map((visit, index) => `
                <div style="${index > 0 ? 'margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;' : ''}">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                      <strong style="color: #111827;">Visit ID:</strong> ${visit.id}<br>
                      <strong style="color: #111827;">Date:</strong> ${new Date(visit.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
                      <strong style="color: #111827;">Time:</strong> ${visit.scheduledTime}
                    </div>
                  </div>
                  <div style="background-color: #f3f4f6; padding: 10px; border-radius: 6px; margin-top: 8px;">
                    <strong style="color: #111827;">Customer:</strong> ${visit.user.firstName} ${visit.user.lastName}<br>
                    <strong style="color: #111827;">Email:</strong> ${visit.user.email}
                  </div>
                </div>
              `).join('')}
            </div>
            
            ${reason ? `
              <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                <strong style="color: #92400e;">Cancellation Reason:</strong> ${reason}
              </div>
            ` : ''}
            
            <p style="margin-bottom: 25px;">
              Please check your dashboard for more details and to manage your store's schedule.
            </p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/manager/visits" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View in Dashboard
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>This is an automated notification from your booking system.</p>
              <p>If you have any questions, please contact your system administrator.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await sendEmail(manager.email, `${cancelledVisits.length} Visit(s) Cancelled - ${store.storeName}`, emailContent);
    
    // Also create in-app notification in your database - NOW manager.id and store.id exist
    await prisma.notification.create({
      data: {
        userId: manager.id,
        type: 'VISIT_CANCELLED',
        title: `${cancelledVisits.length} Visit(s) Cancelled`,
        message: `A customer cancelled ${cancelledVisits.length} scheduled visit(s) to ${store.storeName}`,
        data: {
          storeId: store.id,
          cancelledVisitCount: cancelledVisits.length,
          cancelledVisitIds: cancelledVisits.map(v => v.id),
          reason: reason || null,
        },
        read: false,
      },
    });
    
    console.log(`Notification sent to manager ${manager.email} for ${cancelledVisits.length} cancelled visits`);
  } catch (error) {
    console.error('Failed to send manager notification:', error);
    // Don't fail the entire cancellation if notification fails
  }
}

// Customer confirmation email template - FIXED: lastName can be string | null
async function sendCustomerCancellationConfirmation(data: {
  user: {
    email: string;
    firstName: string;
    lastName: string | null; // CHANGED: Allow null
  };
  cancelledVisits: Array<{
    id: string;
    scheduledDate: Date;
    scheduledTime: string;
    store: {
      storeName: string;
    };
  }>;
  reason?: string;
  totalRefundable?: number;
}) {
  const { user, cancelledVisits, reason, totalRefundable } = data;
  
  const emailContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cancellation Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Cancellation Confirmation</h1>
          </div>
          
          <div style="background-color: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="margin-bottom: 20px;">Hello ${user.firstName},</p>
            
            <p style="margin-bottom: 20px;">
              You have successfully cancelled <strong>${cancelledVisits.length} upcoming visit(s)</strong>.
            </p>
            
            <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #0369a1; margin-top: 0; margin-bottom: 15px;">Cancellation Summary</h3>
              
              ${cancelledVisits.map((visit, index) => `
                <div style="${index > 0 ? 'margin-top: 15px; padding-top: 15px; border-top: 1px solid #bae6fd;' : ''}">
                  <div style="display: flex; justify-content space-between; align-items: center; margin-bottom: 5px;">
                    <div>
                      <strong style="color: #0369a1;">${visit.store.storeName}</strong>
                    </div>
                    <div style="color: #64748b; font-size: 14px;">
                      ${new Date(visit.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${visit.scheduledTime}
                    </div>
                  </div>
                  <div style="font-size: 14px; color: #475569;">
                    Visit ID: ${visit.id}
                  </div>
                </div>
              `).join('')}
            </div>
            
            ${reason ? `
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                <strong style="color: #374151;">Your Reason:</strong> ${reason}
              </div>
            ` : ''}
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
              <h4 style="color: #92400e; margin-top: 0; margin-bottom: 10px;">⚠️ Important Information</h4>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>Store managers have been notified of your cancellations</li>
                <li>Refunds are subject to each store's cancellation policy</li>
                <li>Any discounts associated with these visits have been deactivated</li>
                <li>If you need to rebook, please visit the store's page</li>
              </ul>
            </div>
            
            ${totalRefundable ? `
              <div style="background-color: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                <h4 style="color: #065f46; margin-top: 0; margin-bottom: 10px;">💰 Refund Information</h4>
                <p style="color: #065f46; margin: 0;">
                  Total refundable amount: <strong>$${totalRefundable.toFixed(2)}</strong><br>
                  Refunds will be processed within 5-7 business days.
                </p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/customer" 
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Your Dashboard
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>Need help? Contact our support team at support@yourdomain.com</p>
              <p>This is an automated confirmation email. Please do not reply to this message.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await sendEmail(user.email, `Cancellation Confirmation for ${cancelledVisits.length} Visit(s)`, emailContent);
    console.log(`Confirmation email sent to customer ${user.email}`);
  } catch (error) {
    console.error('Failed to send customer confirmation:', error);
    // Don't fail the entire cancellation if email fails
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { reason } = await request.json();

    // Get all SCHEDULED visits for this user
    const visits = await prisma.visit.findMany({
      where: {
        userId,
        status: 'SCHEDULED',
        checkedIn: false,
      },
      include: {
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
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
      },
    });

    // Filter visits that can be cancelled (more than 1 hour in advance)
    const now = new Date();
    const cancellableVisits = visits.filter(visit => {
      const scheduledDateTime = new Date(visit.scheduledDate);
      const [hours, minutes] = visit.scheduledTime.split(':').map(Number);
      scheduledDateTime.setHours(hours, minutes, 0, 0);
      const timeDiff = scheduledDateTime.getTime() - now.getTime();
      const hoursUntilVisit = timeDiff / (1000 * 60 * 60);
      return hoursUntilVisit >= 1;
    });

    if (cancellableVisits.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No cancellable visits found',
        details: {
          totalVisits: visits.length,
          alreadyCheckedIn: visits.filter(v => v.checkedIn).length,
          withinOneHour: visits.filter(v => {
            const scheduledDateTime = new Date(v.scheduledDate);
            const [hours, minutes] = v.scheduledTime.split(':').map(Number);
            scheduledDateTime.setHours(hours, minutes, 0, 0);
            const timeDiff = scheduledDateTime.getTime() - now.getTime();
            const hoursUntilVisit = timeDiff / (1000 * 60 * 60);
            return hoursUntilVisit < 1;
          }).length,
        },
        suggestion: visits.length > 0 ? 'Some visits may be too close to scheduled time or already checked in. Try cancelling individually.' : 'No scheduled visits found.'
      }, { status: 400 });
    }

    // Group visits by store to send consolidated notifications to each manager
    const visitsByStore = new Map();
    const cancelledVisits = [];
    const cancellationErrors = [];

    for (const visit of cancellableVisits) {
      try {
        const updatedVisit = await prisma.visit.update({
          where: { id: visit.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: now,
            cancelledBy: 'CUSTOMER',
            cancellationReason: reason || 'Bulk cancellation by customer',
          },
        });

        // Create audit log
        await prisma.auditLog.create({
          data: {
            userId: userId,
            storeId: visit.store.id,
            action: 'VISIT_CANCELLED',
            entity: 'Visit',
            entityId: visit.id,
            changes: {
              previousStatus: visit.status,
              newStatus: 'CANCELLED',
              cancelledBy: 'CUSTOMER',
              reason: reason || 'Bulk cancellation',
              hoursUntilVisit: ((new Date(visit.scheduledDate).getTime() + 
                (parseInt(visit.scheduledTime.split(':')[0]) * 60 * 60 * 1000) +
                (parseInt(visit.scheduledTime.split(':')[1]) * 60 * 1000) - now.getTime()) / (1000 * 60 * 60)).toFixed(1),
              scheduledDate: visit.scheduledDate.toISOString(),
              scheduledTime: visit.scheduledTime,
            },
          },
        });

        cancelledVisits.push(updatedVisit);

        // Group by manager for notifications - FIXED: Include all required fields
        if (visit.store.manager) {
          const storeId = visit.store.id;
          if (!visitsByStore.has(storeId)) {
            visitsByStore.set(storeId, {
              manager: {
                id: visit.store.manager.id, // ADDED: manager id
                email: visit.store.manager.email,
                firstName: visit.store.manager.firstName,
                lastName: visit.store.manager.lastName,
              },
              store: {
                id: visit.store.id, // ADDED: store id
                storeName: visit.store.storeName,
              },
              cancelledVisits: []
            });
          }
          visitsByStore.get(storeId).cancelledVisits.push({
            id: visit.id,
            scheduledDate: visit.scheduledDate,
            scheduledTime: visit.scheduledTime,
            user: visit.user,
          });
        }
      } catch (error) {
        console.error(`Failed to cancel visit ${visit.id}:`, error);
        cancellationErrors.push({
          visitId: visit.id,
          store: visit.store.storeName,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Send notifications to managers (one per store)
    const notificationPromises = Array.from(visitsByStore.values()).map(storeData =>
      sendManagerCancellationNotification({
        ...storeData,
        reason
      })
    );

    await Promise.allSettled(notificationPromises);

    // Send confirmation email to customer
    if (cancelledVisits.length > 0) {
      await sendCustomerCancellationConfirmation({
        user: cancellableVisits[0].user,
        cancelledVisits: cancelledVisits.map(v => ({
          id: v.id,
          scheduledDate: v.scheduledDate,
          scheduledTime: v.scheduledTime,
          store: visits.find(visit => visit.id === v.id)?.store || { storeName: 'Unknown Store' }
        })),
        reason,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully cancelled ${cancelledVisits.length} visit(s)`,
      summary: {
        cancelledCount: cancelledVisits.length,
        skippedCount: visits.length - cancellableVisits.length,
        failedCount: cancellationErrors.length,
        totalVisitsFound: visits.length,
      },
      cancelledVisits: cancelledVisits.map(v => ({
        id: v.id,
        storeId: v.storeId,
        scheduledDate: v.scheduledDate,
        scheduledTime: v.scheduledTime,
        status: v.status,
        cancelledAt: v.cancelledAt,
      })),
      errors: cancellationErrors.length > 0 ? cancellationErrors : undefined,
      notifications: {
        managersNotified: visitsByStore.size,
        customerConfirmationSent: cancelledVisits.length > 0,
      },
      policy: {
        minCancellationNotice: '1 hour',
        refundEligibility: 'Cancellations made more than 1 hour before each visit may be eligible for refunds.',
        contactStores: 'For specific refund policies, please contact the stores directly.',
      },
      timestamp: now.toISOString(),
    });

  } catch (error) {
    console.error('Error bulk cancelling visits:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cancel visits', 
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Try cancelling visits individually or contact support.'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check eligibility for bulk cancellation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    
    // Get all SCHEDULED visits for this user
    const visits = await prisma.visit.findMany({
      where: {
        userId,
        status: 'SCHEDULED',
        checkedIn: false,
      },
      include: {
        store: {
          select: {
            storeName: true,
            city: true,
            state: true,
          }
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });

    // Check eligibility for each visit
    const now = new Date();
    
    // Define types for the arrays
    type EligibleVisit = {
      id: string;
      storeName: string;
      location: string;
      scheduledDate: Date;
      scheduledTime: string;
      numberOfPeople: number;
      hoursUntilVisit: string;
    };
    
    type IneligibleVisit = EligibleVisit & {
      reason: string;
    };
    
    const eligibleVisits: EligibleVisit[] = [];
    const ineligibleVisits: IneligibleVisit[] = [];

    visits.forEach(visit => {
      const scheduledDateTime = new Date(visit.scheduledDate);
      const [hours, minutes] = visit.scheduledTime.split(':').map(Number);
      scheduledDateTime.setHours(hours, minutes, 0, 0);
      const timeDiff = scheduledDateTime.getTime() - now.getTime();
      const hoursUntilVisit = timeDiff / (1000 * 60 * 60);
      
      const visitData: EligibleVisit = {
        id: visit.id,
        storeName: visit.store.storeName,
        location: `${visit.store.city}, ${visit.store.state}`,
        scheduledDate: visit.scheduledDate,
        scheduledTime: visit.scheduledTime,
        numberOfPeople: visit.numberOfPeople,
        hoursUntilVisit: hoursUntilVisit.toFixed(1),
      };

      if (hoursUntilVisit >= 1) {
        eligibleVisits.push(visitData);
      } else {
        ineligibleVisits.push({
          ...visitData,
          reason: hoursUntilVisit < 0 ? 'Visit time has passed' : 'Within 1 hour of scheduled time',
        });
      }
    });

    return NextResponse.json({
      canCancelAll: eligibleVisits.length > 0,
      summary: {
        totalVisits: visits.length,
        eligibleForCancellation: eligibleVisits.length,
        notEligible: ineligibleVisits.length,
      },
      eligibleVisits,
      ineligibleVisits,
      requirements: {
        minHoursBeforeCancellation: 1,
        allowedStatuses: ['SCHEDULED'],
        cannotBeCheckedIn: true,
      },
      estimatedRefund: {
        note: 'Refunds are subject to individual store policies',
        contactStores: 'Contact stores directly for specific refund information',
      },
      nextSteps: eligibleVisits.length > 0 ? [
        'All eligible visits will be cancelled at once',
        'Store managers will be notified',
        'You will receive a confirmation email',
        'Refunds will be processed per store policies',
      ] : [
        'No visits eligible for bulk cancellation',
        'Some visits may be too close to scheduled time',
        'Consider cancelling individually if needed',
      ],
      timestamp: now.toISOString(),
    });

  } catch (error) {
    console.error('Error checking bulk cancellation eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to check cancellation eligibility' },
      { status: 500 }
    );
  }
}