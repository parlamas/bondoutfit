//src/app/api/test-visits/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test user exists
    const user = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
      select: { id: true, email: true, name: true }
    });
    
    if (!user) {
      return NextResponse.json({ 
        error: 'No customer user found',
        suggestion: 'Create a customer user first'
      });
    }

    // Test visits for this user
    const visits = await prisma.visit.findMany({
      where: { userId: user.id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
            categories: true,
          }
        }
      },
      take: 5
    });

    return NextResponse.json({
      success: true,
      user,
      visitsCount: visits.length,
      visits,
      userVisitCount: await prisma.visit.count({ where: { userId: user.id } }),
      totalVisitCount: await prisma.visit.count(),
    });
  } catch (error) {
    // Type assertion for the error
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}

