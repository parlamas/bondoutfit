//src/app/api/visits/[id]/cancel/route.ts:

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
    const { reason } = await req.json();
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    const visit = await prisma.visit.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    // Check authorization: customer can cancel their own visit, store manager their store's visits
    const isCustomerOwner = userRole === 'CUSTOMER' && visit.userId === userId;
    const isStoreManager = userRole === 'STORE_MANAGER' && visit.store.managerId === userId;
    
    if (!isCustomerOwner && !isStoreManager) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Update visit status
    const updatedVisit = await prisma.visit.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: userRole === 'CUSTOMER' ? 'CUSTOMER' : 'STORE',
        cancellationReason: reason || null,
      },
    });

    return NextResponse.json({
      success: true,
      cancelledBy: userRole === 'CUSTOMER' ? 'customer' : 'store',
      visit: updatedVisit,
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel visit' },
      { status: 500 }
    );
  }
}