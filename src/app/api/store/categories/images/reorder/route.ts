//src/app/api/store/categories/images/reorder/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { images } = await req.json();

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