//src/app/api/store/collections/[collectionId]/images/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { collectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'STORE_MANAGER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { url, description, order } = await req.json();

  const image = await prisma.collectionImage.create({
    data: {
      collectionId: params.collectionId,
      url,
      description,
      order,
    },
  });

  return NextResponse.json(image);
}

export async function PATCH(
  req: Request,
  { params }: { params: { collectionId: string } }
) {
  const { images } = await req.json();

  await Promise.all(
    images.map((img: any) =>
      prisma.collectionImage.update({
        where: { id: img.id },
        data: { order: img.order },
      })
    )
  );

  return NextResponse.json({ success: true });
}
