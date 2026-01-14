//src/app/api/debug-hash/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { hash } from 'bcryptjs';

export async function GET() {
  const testPassword = 'TestPassword123';
  
  try {
    const hash1 = await hashPassword(testPassword);
    const hash2 = await hash(testPassword, 12);
    
    return NextResponse.json({
      comparison: {
        areIdentical: hash1 === hash2,
        hash1: hash1.substring(0, 60) + '...',
        hash2: hash2.substring(0, 60) + '...',
        sameAlgorithm: hash1.substring(0, 7) === hash2.substring(0, 7),
        sameLength: hash1.length === hash2.length,
        hash1Algorithm: hash1.substring(0, 7),
        hash2Algorithm: hash2.substring(0, 7)
      },
      methods: {
        hashPassword: 'import { hashPassword } from "@/lib/auth"',
        directHash: 'import { hash } from "bcryptjs"; await hash(password, 12)'
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    });
  }
}