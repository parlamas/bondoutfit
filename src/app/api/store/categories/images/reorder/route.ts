//src/app/api/store/categories/images/reorder/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isDemoUser } from '@/lib/demo';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'STORE_MANAGER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { images } = await req.json();

  // Demo accounts: simulate a successful reorder without writing to the database
  if (isDemoUser(session)) {
    return NextResponse.json({ ok: true });
  }

  // Update StoreCategoryImage table
  await Promise.all(
    images.map((img: { id: string; order: number }) =>
      prisma.storeCategoryImage.update({
        where: { id: img.id },
        data: { order: img.order },
      })
    )
  );

  // ALSO update StoreImage table (for images with categoryId)
  await Promise.all(
    images.map((img: { id: string; order: number }) =>
      prisma.storeImage.update({
        where: { id: img.id },
        data: { order: img.order },
      })
    )
  );

  return NextResponse.json({ ok: true });
}