//src/app/api/debug-discounts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Check for store ID in query params or use your store ID
    const url = new URL(req.url);
    const storeId = url.searchParams.get('storeId') || 'cmkgtzpno0002jo04ueqlfrss';
    
    console.log('=== DEBUG DISCOUNTS ===');
    console.log('Store ID:', storeId);
    
    // Get ALL discounts for this store
    const discounts = await prisma.discount.findMany({
      where: {
        storeId: storeId,
      },
      select: {
        id: true,
        title: true,
        status: true,
        isActive: true,
        validFrom: true,
        validTo: true,
        svdOnly: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    console.log('Found discounts:', discounts.length);
    discounts.forEach(d => {
      console.log(`- "${d.title}": status=${d.status}, isActive=${d.isActive}, validFrom=${d.validFrom}, validTo=${d.validTo}`);
    });
    
    return NextResponse.json({
      storeId,
      count: discounts.length,
      discounts: discounts
    });
  } catch (error: any) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: error.message },
      { status: 500 }
    );
  }
}