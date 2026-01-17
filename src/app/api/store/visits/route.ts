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
      select: { 
        id: true,
        storeName: true,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get query parameters for filtering
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const search = url.searchParams.get('search');

    // Build filter conditions
    const where: any = { storeId: store.id };

    // Filter by status if provided
    if (status && status !== 'ALL') {
      if (status === 'CANCELLED_AND_MISSED') {
        where.status = { in: ['CANCELLED', 'MISSED'] };
      } else {
        where.status = status;
      }
    }

    // Filter by date range if provided
    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) {
        where.scheduledDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.scheduledDate.lte = new Date(dateTo);
      }
    }

    // Search by customer name or email if provided
    if (search) {
      where.OR = [
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          }
        },
        { customerNotes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const visits = await prisma.visit.findMany({
      where,
      orderBy: [
        { scheduledDate: 'desc' },
        { scheduledTime: 'desc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            gender: true,
            age: true,
            heightCm: true,
            weightKg: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalVisits = visits.length;
    const scheduledVisits = visits.filter(v => v.status === 'SCHEDULED').length;
    const completedVisits = visits.filter(v => v.status === 'COMPLETED').length;
    const cancelledVisits = visits.filter(v => v.status === 'CANCELLED').length;
    const missedVisits = visits.filter(v => v.status === 'MISSED').length;

    // Format the response with additional statistics
    const formattedVisits = visits.map(visit => ({
      id: visit.id,
      scheduledDate: visit.scheduledDate.toISOString(),
      scheduledTime: visit.scheduledTime,
      numberOfPeople: visit.numberOfPeople,
      status: visit.status,
      checkedIn: visit.checkedIn,
      checkedInAt: visit.checkedInAt?.toISOString() || null,
      cancelledAt: visit.cancelledAt?.toISOString() || null,
      cancellationReason: visit.cancellationReason,
      customerNotes: visit.customerNotes,
      discountUnlocked: visit.discountUnlocked,
      discountUsed: visit.discountUsed,
      // Only include fields that exist in your schema
      // discountCode: visit.discountCode, // Uncomment if this field exists
      user: visit.user,
      storeName: store.storeName,
    }));

    return NextResponse.json({
      visits: formattedVisits,
      statistics: {
        total: totalVisits,
        scheduled: scheduledVisits,
        completed: completedVisits,
        cancelled: cancelledVisits,
        missed: missedVisits,
        today: visits.filter(v => {
          const visitDate = new Date(v.scheduledDate);
          const today = new Date();
          return visitDate.toDateString() === today.toDateString();
        }).length,
      },
      filters: {
        status,
        dateFrom,
        dateTo,
        search,
      },
      store: {
        id: store.id,
        name: store.storeName,
      },
    });

  } catch (error) {
    console.error('Error fetching store visits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visits', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Remove the POST endpoint if you don't need it, or update with your schema
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'STORE_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      error: 'POST method not implemented. Use the regular visit creation flow.',
    }, { status: 501 });

  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}