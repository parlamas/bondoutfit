//src/app//api/store/categories/reorder/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { categories } = await req.json();

  await Promise.all(
    categories.map((cat: { id: string; order: number }) =>
      prisma.storeCategory.update({
        where: { id: cat.id },
        data: { order: cat.order },
      })
    )
  );

  return NextResponse.json({ success: true });
}