// src/app/api/debug/route.ts

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    // Check all critical env vars
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
    
    // Check NextAuth version
    nextAuthVersion: "5.0.0-beta.30 (you're using beta!)",
    
    timestamp: new Date().toISOString()
  })
}