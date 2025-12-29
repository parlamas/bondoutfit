
//src/app/api/auth/signup/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

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

    // 4. Create verification token
    const verificationToken = crypto.randomUUID();
    const verificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    // 5. Create user + store atomically
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
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

          verificationToken,
          verificationTokenExpires,
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
            managerId: createdUser.id,
          },
        });
      }

      return createdUser;
    });

    // 6. Send verification email (correct call)
    await sendVerificationEmail(
      user.email,
      verificationToken
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
