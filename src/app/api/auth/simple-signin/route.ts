import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Simple auth - no NextAuth
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password || user.role !== 'STORE_MANAGER') {
      return NextResponse.json(
        { error: 'Invalid credentials or not a store manager' },
        { status: 401 }
      );
    }

    const valid = await compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create a simple session cookie manually
    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };

    // Set a cookie
    const cookie = `simple-session=${encodeURIComponent(JSON.stringify(sessionData))}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${30 * 24 * 60 * 60}`;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirect: '/dashboard/store',
    });

    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error) {
    console.error('Simple signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}