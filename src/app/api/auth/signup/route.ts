// src/app/api/auth/signup/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      name,
      role,

      // customer fields
      customerCity,
      gender,
      age,
      heightCm,
      weightKg,
      occupation,
      phone,

      // store fields
      storeName,
      country,
      city,
      street,
      streetNumber,
      floor,
      state,
      zip,
      categories,
    } = body;

    // 1. Guard
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    // 2. Check existing user
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4 + 5. Create user (and store if manager) atomically
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role,

          phone,
          customerCity,
          gender,
          age,
          heightCm,
          weightKg,
          occupation,
        },
      });

      if (role === "STORE_MANAGER") {
        if (
          !storeName ||
          !country ||
          !city ||
          !street ||
          !streetNumber ||
          !zip
        ) {
          throw new Error("Missing store information");
        }

        await tx.store.create({
          data: {
            name: storeName,
            country,
            city,
            street,
            streetNumber,
            floor,
            state,
            zip,
            categories,
            managerId: user.id,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
