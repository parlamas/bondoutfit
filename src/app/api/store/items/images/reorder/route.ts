//src/app/api/store/items/images/reorder/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'STORE_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, images } = await req.json();

    // Verify item belongs to this store manager
    const item = await prisma.storeItem.findUnique({
      where: { id: itemId },
      include: { store: true }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const store = await prisma.store.findUnique({
      where: { managerId: session.user.id }
    });

    if (!store || item.storeId !== store.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update order for each image
    await prisma.$transaction(
      images.map((img: { id: string; order: number }) =>
        prisma.storeItemImage.update({
          where: { id: img.id },
          data: { order: img.order }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder error:', error);
    return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
  }
}
