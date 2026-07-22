// src/app/api/user/notification-preferences/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { isDemoUser } from '@/lib/demo';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { notificationPreferences: true },
  });

  return NextResponse.json(user?.notificationPreferences || null);
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Demo accounts: simulate a successful update without writing to the database
  if (isDemoUser(session)) {
    return NextResponse.json({ userId: user.id, ...data });
  }

  const preferences = await prisma.userNotificationPreference.upsert({
    where: { userId: user.id },
    update: data,
    create: {
      userId: user.id,
      ...data,
    },
  });

  return NextResponse.json(preferences);
}