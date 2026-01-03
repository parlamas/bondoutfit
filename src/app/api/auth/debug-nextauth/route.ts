import { NextResponse } from 'next/server';

export async function GET() {
  // Simple test without trying to import authOptions
  return NextResponse.json({
    success: true,
    message: 'Debug endpoint working',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasNEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    },
  });
}

