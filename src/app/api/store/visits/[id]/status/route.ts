//src/app/api/store/visits/[id]/status/route.ts:

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'STORE_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !['SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify visit belongs to manager's store
    const visit = await prisma.visit.findFirst({
      where: {
        id: params.id,
        store: {
          managerId: (session.user as any).id,
        },
      },
    });

    if (!visit) {
      return NextResponse.json(
        { error: 'Visit not found or unauthorized' },
        { status: 404 }
      );
    }

    const updatedVisit = await prisma.visit.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: `Visit status updated to ${status}`,
      visit: updatedVisit,
    });
  } catch (error) {
    console.error('Error updating visit status:', error);
    return NextResponse.json(
      { error: 'Failed to update visit status' },
      { status: 500 }
    );
  }
}