// app/api/store/images/reorder/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth'; // ADD THIS LINE
import { isDemoUser } from '@/lib/demo';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { images } = await req.json();

    // Demo accounts: simulate a successful reorder without writing to the database
    if (isDemoUser(session)) {
      return NextResponse.json({ success: true });
    }

    const updates = images.map((img: any) =>
      prisma.storeImage.update({
        where: { id: img.id },
        data: { order: img.order },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder images:', error);
    return NextResponse.json(
      { error: 'Failed to reorder images' },
      { status: 500 }
    );
  }
}
