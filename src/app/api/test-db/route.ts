import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test connection
    await prisma.$connect();
    
    // Try a simple query
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      connected: true,
      userCount,
      message: 'Database connection successful',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      connected: false,
      error: error.message,
      stack: error.stack,
      message: 'Database connection failed',
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}