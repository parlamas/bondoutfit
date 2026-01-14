//src/app/api/test-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Test password request:', { email, passwordLength: password?.length });
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        emailVerified: true
      }
    });

    console.log('User found:', {
      exists: !!user,
      email: user?.email,
      role: user?.role,
      hasPassword: !!user?.password,
      passwordStartsWith: user?.password?.substring(0, 10)
    });

    if (!user) {
      return NextResponse.json({ 
        exists: false,
        message: 'User not found'
      });
    }

    if (!user.password) {
      return NextResponse.json({
        exists: true,
        hasPassword: false,
        message: 'User has no password'
      });
    }

    // Test password
    const isValid = await compare(password, user.password);
    
    console.log('Password valid:', isValid);
    
    return NextResponse.json({ 
      exists: true,
      hasPassword: true,
      passwordValid: isValid,
      role: user.role,
      emailVerified: user.emailVerified,
      passwordHashPreview: user.password.substring(0, 30) + '...',
      isBcryptHash: user.password.startsWith('$2') // bcrypt hashes start with $2
    });

  } catch (error: any) {
    console.error('Test password error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}