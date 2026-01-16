//app/api/customer/visits/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching customer visits...');
    const session = await getServerSession(authOptions);
    
    console.log('API: Session:', session);
    console.log('API: User ID:', session?.user?.id);
    
    if (!session || !session.user?.id) {
      console.log('API: Unauthorized - no session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    console.log('API: Status filter:', statusFilter);
    console.log('API: Page:', page, 'Limit:', limit);

    // Build filter object - IMPORTANT: Use userId not customerId
    const where: any = {
      userId: session.user.id, // Changed from customerId to userId
    };

    // Apply status filter if provided
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'scheduled') {
        where.status = 'SCHEDULED'; // Your enum is uppercase
      } else if (statusFilter === 'completed') {
        where.status = 'COMPLETED';
      } else if (statusFilter === 'cancelled') {
        where.status = 'CANCELLED';
      } else if (statusFilter === 'upcoming') {
        where.status = 'SCHEDULED';
        where.scheduledDate = { gte: new Date() };
      } else if (statusFilter === 'past') {
        where.OR = [
          { status: 'COMPLETED' },
          {
            status: 'SCHEDULED',
            scheduledDate: { lt: new Date() },
          },
        ];
      }
    }

    console.log('API: Prisma where clause:', JSON.stringify(where, null, 2));

    try {
      // Get visits with store details
      const [visits, total] = await Promise.all([
        prisma.visit.findMany({
          where,
          include: {
            store: {
              select: {
                id: true,
                storeName: true,
                city: true,
                country: true,
                categories: true,
                logoUrl: true, // Use logoUrl instead of image
              },
            },
            user: { // Changed from customer to user
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: [
            { scheduledDate: 'desc' },
            { scheduledTime: 'desc' },
          ],
          skip,
          take: limit,
        }),
        prisma.visit.count({ where }),
      ]);

      console.log('API: Found', visits.length, 'visits out of', total, 'total');

      // Format dates for frontend
      const formattedVisits = visits.map(visit => ({
        ...visit,
        id: visit.id,
        store: visit.store,
        scheduledDate: visit.scheduledDate.toISOString().split('T')[0],
        scheduledTime: visit.scheduledTime,
        numberOfPeople: visit.numberOfPeople || 1,
        notes: visit.notes || undefined,
        status: visit.status.toLowerCase(), // Convert to lowercase for frontend
        createdAt: visit.createdAt.toISOString(),
        updatedAt: visit.updatedAt.toISOString(),
      }));

      return NextResponse.json({
        visits: formattedVisits,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      });
    } catch (dbError) {
      console.error('API: Database error:', dbError);
      // Type assertion for the error
      const error = dbError as Error;
      return NextResponse.json(
        { 
          error: 'Database error', 
          details: error.message 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API Error fetching customer visits:', error);
    // Type assertion for the error
    const err = error as Error;
    return NextResponse.json(
      { 
        error: 'Failed to fetch visits',
        details: err.message 
      },
      { status: 500 }
    );
  }
}