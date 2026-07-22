//src/app/api/user/profile/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { isDemoUser } from '@/lib/demo';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone } = body;

    // Parse name into firstName and lastName
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Demo accounts: simulate a successful update without writing to the database
    if (isDemoUser(session)) {
      return NextResponse.json({
        success: true,
        user: {
          id: session.user.id,
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
        },
      });
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName,
        lastName,
        email,
        phoneNumber: phone,
      },
    });

    return NextResponse.json({ 
      success: true,
      user: {
        id: updatedUser.id,
        name: `${updatedUser.firstName} ${updatedUser.lastName || ''}`.trim(),
        email: updatedUser.email,
        phone: updatedUser.phoneNumber,
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        email: user.email,
        phone: user.phoneNumber,
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}