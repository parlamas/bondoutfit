// src/app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
// REMOVE THIS LINE: import { hash } from "bcryptjs"; ← This is unused

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

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || "CUSTOMER", // Add default value
        ...(role === "STORE_MANAGER" && storeName && { storeName }),
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { user: userWithoutPassword, message: "User created successfully" },
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