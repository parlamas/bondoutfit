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
    
    console.log('=== DISCOUNTS API DEBUG - FULL ===');
    console.log('Store ID:', storeId);
    console.log('Current date:', now.toISOString());
    console.log('Current date (local):', now.toLocaleString());
    
    // FIRST: Get ALL discounts for this store to debug
    const allDiscounts = await prisma.discount.findMany({
      where: {
        storeId,
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
        createdAt: true,
        updatedAt: true,
      },
    });
    
    console.log('=== ALL DISCOUNTS IN DATABASE ===');
    console.log('Total discounts:', allDiscounts.length);
    
    allDiscounts.forEach((discount, index) => {
      console.log(`\nDiscount ${index + 1}:`);
      console.log('  Title:', discount.title);
      console.log('  Status:', discount.status);
      console.log('  isActive:', discount.isActive);
      console.log('  validFrom:', discount.validFrom);
      console.log('  validTo:', discount.validTo);
      console.log('  svdOnly:', discount.svdOnly);
      console.log('  Type:', discount.type);
      console.log('  Code:', discount.code);
      console.log('  Created:', discount.createdAt);
      console.log('  Updated:', discount.updatedAt);
    });
    
    // SECOND: Apply filters manually to see what passes
const filteredDiscounts = allDiscounts.filter(discount => {
  const isPosted = discount.status === 'POSTED';
  const isActive = discount.isActive === true;
  
  // Date filtering - ONLY check expiration (validTo), not start date (validFrom)
  const now = new Date();
  const validToPass = !discount.validTo || new Date(discount.validTo) >= now;
  
  const passes = isPosted && isActive && validToPass;
  
  console.log(`\nFilter check for "${discount.title}":`);
  console.log('  Is POSTED?', isPosted, `(${discount.status})`);
  console.log('  Is active?', isActive, `(${discount.isActive})`);
  console.log('  Valid to pass?', validToPass, `(validTo: ${discount.validTo})`);
  console.log('  PASSES ALL?', passes);
  
  return passes;
});
    
    console.log('\n=== FILTERED DISCOUNTS ===');
    console.log('Passing discounts:', filteredDiscounts.length);
    
    // Return only the filtered discounts
    const result = filteredDiscounts.map(d => ({
      id: d.id,
      title: d.title,
      description: d.description,
      discountPercent: d.discountPercent,
      discountAmount: d.discountAmount,
      validFrom: d.validFrom,
      validTo: d.validTo,
      code: d.code,
      type: d.type,
      minPurchase: d.minPurchase,
      maxDiscount: d.maxDiscount,
      svdOnly: d.svdOnly,
      status: d.status,
      isActive: d.isActive,
    }));
    
    console.log('\n=== RETURNING ===');
    console.log('Number of discounts to return:', result.length);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}

