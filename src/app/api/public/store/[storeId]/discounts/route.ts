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
    
    // Fetch only POSTED discounts that are currently valid
    const discounts = await prisma.discount.findMany({
      where: {
        storeId,
        status: 'POSTED',
        validFrom: { lte: now }, // Discount has started
        validTo: { gte: now },   // Discount hasn't expired
        // Exclude deleted discounts by checking status != DELETED
        // (schema already filters by status: 'POSTED')
        isActive: true,           // Additional filter for active flag
      },
      select: {
        id: true,
        title: true,
        description: true,
        discountPercent: true,
        discountAmount: true,
        validFrom: true,
        validTo: true,
        code: true,               // This is the field name in your schema
        type: true,
        minPurchase: true,
        maxDiscount: true,
        svdOnly: true,            // Scheduled Visit Discount flag
      },
      orderBy: {
        validFrom: 'asc',
      },
    });
    
    return NextResponse.json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}