//src/app/api/store/collections/images/[imageId]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: Request,
  { params }: { params: { imageId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'STORE_MANAGER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.collectionImage.delete({
    where: { id: params.imageId },
  });

  return NextResponse.json({ success: true });
}
