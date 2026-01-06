//src/app/api/store/collections/images/reorder/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'STORE_MANAGER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { images } = await req.json();

  if (!Array.isArray(images)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  await prisma.$transaction(
    images.map((img: { id: string; order: number }) =>
      prisma.collectionImage.update({
        where: { id: img.id },
        data: { order: img.order },
      })
    )
  );

  return NextResponse.json({ success: true });
}
