//src/app/api/check-deployd-email/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // Test what the CURRENT code would generate
  const testRole = "STORE_MANAGER";
  
  // This is what line 14 SHOULD produce
  const typeInUrl = testRole === "STORE_MANAGER" || testRole === "ADMIN" ? "store" : "customer";
  
  return NextResponse.json({
    test: "Email function check",
    role: testRole,
    typeGenerated: typeInUrl,
    correct: typeInUrl === "store" ? "✅ YES" : "❌ NO - BUG STILL EXISTS",
    timestamp: new Date().toISOString()
  });
}