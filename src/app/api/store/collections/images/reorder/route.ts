//src/app/api/store/collections/images/reorder/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isDemoUser } from '@/lib/demo';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'STORE_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collectionId, images } = await req.json();

    // Demo accounts: simulate a successful reorder without writing to the database
    if (isDemoUser(session)) {
      return NextResponse.json({ success: true });
    }

    // Update order for each image
    await prisma.$transaction(
      images.map((img: { id: string; order: number }) =>
        prisma.collectionImage.update({
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