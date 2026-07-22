//src/app/api/store/categories/images/[imageId]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isDemoUser } from '@/lib/demo';

export async function PATCH(
  req: Request,
  { params }: { params: { imageId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'STORE_MANAGER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { description } = await req.json();

  // Demo accounts: simulate a successful update without writing to the database
  if (isDemoUser(session)) {
    return NextResponse.json({ id: params.imageId, description });
  }

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
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'STORE_MANAGER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Demo accounts: simulate a successful deletion without writing to the database
  if (isDemoUser(session)) {
    return NextResponse.json({ ok: true });
  }

  await prisma.storeCategoryImage.delete({
    where: { id: params.imageId },
  });

  return NextResponse.json({ ok: true });
}