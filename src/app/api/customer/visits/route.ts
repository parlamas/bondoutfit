//app/api/customer/visits/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

// GET method - Fetch customer visits
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
      // Get visits with store details - UPDATED to include notes and inspirationImages
      const [visits, total] = await Promise.all([
        prisma.visit.findMany({
          where,
          select: {
            id: true,
            scheduledDate: true,
            scheduledTime: true,
            numberOfPeople: true,
            status: true,
            notes: true,
            inspirationImages: true,
            createdAt: true,
            updatedAt: true,
            store: {
              select: {
                id: true,
                storeName: true,
                city: true,
                country: true,
                categories: true,
                logoUrl: true,
              },
            },
            user: {
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

      // Format dates for frontend - UPDATED to include notes and inspirationImages
      const formattedVisits = visits.map(visit => ({
        id: visit.id,
        scheduledDate: visit.scheduledDate.toISOString().split('T')[0],
        scheduledTime: visit.scheduledTime,
        numberOfPeople: visit.numberOfPeople || 1,
        notes: visit.notes || undefined,
        inspirationImages: visit.inspirationImages || [],
        status: visit.status.toLowerCase(),
        createdAt: visit.createdAt.toISOString(),
        updatedAt: visit.updatedAt.toISOString(),
        store: {
          id: visit.store.id,
          name: visit.store.storeName,
          city: visit.store.city,
          country: visit.store.country,
          categories: visit.store.categories,
          logoUrl: visit.store.logoUrl,
        },
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

// POST method - Create a new visit
export async function POST(request: NextRequest) {
  try {
    console.log('API: Creating new visit...');
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      console.log('API: Unauthorized - no session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('API: Request body:', body);
    
    const { 
      storeId, 
      scheduledDate, 
      scheduledTime, 
      numberOfPeople, 
      notes,
      inspirationImages,
      inspirationImageIds,
      discountId 
    } = body;

    // Validate required fields
    if (!storeId || !scheduledDate || !scheduledTime || !numberOfPeople) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse the date and time
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
    
    // Check if date is in the past
    if (scheduledDateTime < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book visits in the past' },
        { status: 400 }
      );
    }

    // Verify the store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, storeName: true }
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // If discountId is provided, verify it exists and is valid
    if (discountId) {
      const discount = await prisma.discount.findUnique({
        where: { id: discountId }
      });
      
      if (!discount) {
        return NextResponse.json(
          { error: 'Discount not found' },
          { status: 404 }
        );
      }
    }

    // Create the visit
    const visit = await prisma.visit.create({
      data: {
        userId: session.user.id,
        storeId,
        scheduledDate: scheduledDateTime,
        scheduledTime,
        numberOfPeople: parseInt(numberOfPeople.toString()),
        notes: notes || null,
        discountId: discountId || null,
        status: 'SCHEDULED',
        // Add the image fields (they'll be undefined if not provided)
        ...(inspirationImages && { inspirationImages }),
        ...(inspirationImageIds && { inspirationImageIds }),
      },
      include: {
        store: {
          select: {
            storeName: true,
            email: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    console.log('API: Visit created successfully:', visit.id);

    // TODO: Send confirmation notification
    // await sendVisitConfirmation(visit);

    return NextResponse.json(visit, { status: 201 });

  } catch (error) {
    console.error('API Error creating visit:', error);
    const err = error as Error;
    return NextResponse.json(
      { 
        error: 'Failed to create visit',
        details: err.message 
      },
      { status: 500 }
    );
  }
}