// src/app/api/auth/verify-email/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Verify-email endpoint called");
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    
    console.log("🔍 Received token:", token);
    console.log("🔍 Token length:", token?.length);

    if (!token) {
      console.log("❌ No token provided");
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: {
          gt: new Date(),
        },
      },
    });

    console.log("🔍 User found:", user?.email);
    console.log("🔍 Token matches:", !!user);

    if (!user) {
      console.log("❌ No user found or token expired");
      return NextResponse.redirect(
        new URL("/auth/signin?error=InvalidToken", request.url)
      );
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    console.log("✅ User verified successfully:", user.email);
    
    return NextResponse.redirect(
      new URL("/auth/signin?verified=true", request.url)
    );
    
  } catch (error) {
    console.error("❌ Verification error:", error);
    return NextResponse.redirect(
      new URL("/auth/signin?error=VerificationFailed", request.url)
    );
  }
}