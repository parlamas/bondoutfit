// src/app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/email"; // ✅ ADD THIS IMPORT

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, storeName } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // ✅ DEBUG LINES:
    console.log("🔐 Generated verification token:", verificationToken);
    console.log("🔐 Token length:", verificationToken.length);
    console.log("🔐 Verification URL:", `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`);

    // Create user with verification token (email NOT verified yet)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || "CUSTOMER",
        ...(role === "STORE_MANAGER" && storeName && { storeName }),
        verificationToken,
        verificationTokenExpires,
        emailVerified: null, // Not verified yet
      },
    });

    // ✅ USE THE CENTRALIZED EMAIL SERVICE:
    await sendVerificationEmail(email, verificationToken);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        user: userWithoutPassword, 
        message: "User created successfully. Please check your email to verify your account." 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}