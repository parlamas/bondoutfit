//src/app/api/public/store/[storeId]/categories/[categoryId]/images/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  // Get images from BOTH tables
  const [categoryImages, storeImages] = await Promise.all([
    // StoreCategoryImage table (original)
    prisma.storeCategoryImage.findMany({
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
    }),
    
    // StoreImage table with categoryId (new)
    prisma.storeImage.findMany({
      where: {
        storeId: params.storeId,
        categoryId: params.categoryId,
        status: 'ACTIVE',
        type: 'GALLERY',
      },
      select: {
        id: true,
        imageUrl: true,
      },
      orderBy: {
        order: 'asc',
      },
    }),
  ]);

  // Combine and deduplicate images
  const allImages = [...categoryImages, ...storeImages];
  
  return NextResponse.json(allImages);
}