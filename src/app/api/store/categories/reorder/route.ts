//src/app//api/store/categories/reorder/route.ts

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

  const { categories } = await req.json();

  // Demo accounts: simulate a successful reorder without writing to the database
  if (isDemoUser(session)) {
    return NextResponse.json({ success: true });
  }

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