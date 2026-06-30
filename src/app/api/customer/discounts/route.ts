//src/app/api/customer/discounts/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Get all visits for this user that have discounts
    const visits = await prisma.visit.findMany({
      where: {
        userId: session.user.id,
        discountId: { not: null }, // Only visits with discounts
        ...(status && status !== 'all' ? {
          discount: {
            status: status === 'available' ? 'POSTED' : 
                   status === 'used' ? 'DISMOUNTED' : undefined
          }
        } : {})
      },
      include: {
        discount: {
          include: {
            store: {
              select: {
                id: true,
                storeName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the expected format
    const discounts = visits
      .filter(visit => visit.discount) // Filter out any null discounts
      .map(visit => ({
        id: visit.discount!.id,
        code: visit.discount!.code || `DISCOUNT-${visit.id.slice(0, 8)}`,
        percentage: visit.discount!.discountPercent || 0,
        validUntil: visit.discount!.validTo || visit.scheduledDate,
        status: getDiscountStatus(visit.discount!, visit),
        store: {
          id: visit.discount!.store.id,
          name: visit.discount!.store.storeName,
        },
        visit: {
          id: visit.id,
          scheduledDate: visit.scheduledDate,
        },
      }));

    return NextResponse.json({ discounts });
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDiscountStatus(discount: any, visit: any): 'available' | 'used' | 'expired' {
  // Check if discount is used
  if (visit.discountUsed) {
    return 'used';
  }
  
  // Check if discount is expired
  if (discount.validTo && new Date(discount.validTo) < new Date()) {
    return 'expired';
  }
  
  // Check if visit is completed but discount not used
  if (visit.status === 'COMPLETED' && !visit.discountUsed) {
    return 'available';
  }
  
  // Check if visit is scheduled and discount is still valid
  if (visit.status === 'SCHEDULED' && discount.validTo && new Date(discount.validTo) >= new Date()) {
    return 'available';
  }
  
  return 'expired';
}