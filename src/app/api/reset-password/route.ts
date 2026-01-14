//src/app/api/reset-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and newPassword required' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
      select: {
        email: true,
        role: true,
        name: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      user
    });

  } catch (error: any) {
    console.error('Reset password error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}