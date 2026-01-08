//src/app/api/public/store/[storeId]/categories/[categoryId]/images/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  const images = await prisma.storeCategoryImage.findMany({
    where: {
      categoryId: params.categoryId,
      status: 'ACTIVE',
      category: {
        storeId: params.storeId,
      },
    },
    select: {
      id: true,
      imageUrl: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  return NextResponse.json(images);
}

