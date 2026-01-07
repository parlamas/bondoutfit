//src/app/api/store/categories/images/[imageId]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { imageId: string } }
) {
  const { description } = await req.json();

  const image = await prisma.storeCategoryImage.update({
    where: { id: params.imageId },
    data: { description },
  });

  return NextResponse.json(image);
}

export async function DELETE(
  _: Request,
  { params }: { params: { imageId: string } }
) {
  await prisma.storeCategoryImage.delete({
    where: { id: params.imageId },
  });

  return NextResponse.json({ ok: true });
}
