//src/app/api/visits/[id]/scan/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { action } = await req.json(); // 'check-in' or 'complete'

    const visit = await prisma.visit.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    // Verify scanner is store staff (store manager or employee)
    const isStoreStaff = session.user.role === 'STORE_MANAGER' || 
                         (await prisma.store.findFirst({
                           where: {
                             id: visit.storeId,
                             managerId: (session.user as any).id,
                           },
                         }));

    if (!isStoreStaff) {
      return NextResponse.json({ error: 'Not authorized to scan' }, { status: 403 });
    }

    let updatedVisit;
    const now = new Date();

    if (action === 'check-in') {
      // First scan - Check In
      updatedVisit = await prisma.visit.update({
        where: { id },
        data: {
          checkedIn: true,
          checkedInAt: now,
          lastScanAt: now,
          discountUnlocked: true, // Unlock discount on check-in
        },
      });
    } else if (action === 'complete') {
      // Second scan - Complete Visit
      updatedVisit = await prisma.visit.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: now,
          lastScanAt: now,
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      visit: updatedVisit,
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: 'Failed to process scan' },
      { status: 500 }
    );
  }
}