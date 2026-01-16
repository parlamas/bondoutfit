//src/app/api/public/store/[storeId]/discounts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;
    
    const now = new Date();
    
    console.log('=== DISCOUNTS API DEBUG ===');
    console.log('Store ID:', storeId);
    console.log('Current date for filtering:', now.toISOString());
    
    // Fetch POSTED discounts with proper date filtering
    const discounts = await prisma.discount.findMany({
      where: {
        storeId,
        status: 'POSTED',
        isActive: true,
        // Handle date filtering properly:
        // - If validFrom is null, discount is valid (no start date restriction)
        // - If validFrom is set, check if now is after or equal to validFrom
        // - If validTo is null, discount never expires
        // - If validTo is set, check if now is before or equal to validTo
        AND: [
          {
            OR: [
              { validFrom: null },
              { validFrom: { lte: now } }
            ]
          },
          {
            OR: [
              { validTo: null },
              { validTo: { gte: now } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        discountPercent: true,
        discountAmount: true,
        validFrom: true,
        validTo: true,
        code: true,
        type: true,
        minPurchase: true,
        maxDiscount: true,
        svdOnly: true,
        status: true,
        isActive: true,
      },
      orderBy: {
        validFrom: 'asc',
      },
    });
    
    console.log('Number of discounts found:', discounts.length);
    console.log('Discount details:', discounts.map(d => ({
      title: d.title,
      status: d.status,
      isActive: d.isActive,
      validFrom: d.validFrom,
      validTo: d.validTo,
      svdOnly: d.svdOnly,
      hasCode: !!d.code
    })));
    
    return NextResponse.json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}