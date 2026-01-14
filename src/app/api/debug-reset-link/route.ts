//src/app/api/debug-reset-link/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  // Test what link email would create
  const testToken = 'test-token-123';
  const testRole = 'STORE_MANAGER';
  
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${testToken}&type=${
    testRole === "STORE_MANAGER" || testRole === "ADMIN" ? "store" : "customer"
  }`;
  
  return NextResponse.json({
    testRole,
    resetUrl,
    typeInUrl: resetUrl.includes('type=store') ? 'store' : 'customer'
  });
}