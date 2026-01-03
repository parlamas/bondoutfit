import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    // Check critical auth env vars
    hasNEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    hasNEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '***SET***' : 'MISSING',
    
    // Check database
    hasDATABASE_URL: !!process.env.DATABASE_URL,
    DATABASE_URL: process.env.DATABASE_URL ? '***SET***' : 'MISSING',
    
    // Environment
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
  });
}