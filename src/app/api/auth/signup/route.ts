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

    /* =========================
       BASIC VALIDATION
    ========================= */

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    if (role === "STORE_MANAGER") {
      if (
        !storeName?.trim() ||
        !country?.trim() ||
        !city?.trim() ||
        !street?.trim() ||
        !streetNumber?.trim() ||
        !zip?.trim()
      ) {
        return NextResponse.json(
          { error: "Missing store information" },
          { status: 400 }
        );
      }
    }

    /* =========================
       DUPLICATE USER CHECK
    ========================= */

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    /* =========================
       PREPARE DATA
    ========================= */

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomUUID();
    const verificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    const safeCategories = Array.isArray(categories) ? categories : [];

    /* =========================
       TRANSACTION
    ========================= */

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
            categories: safeCategories,
            managerId: createdUser.id,
          },
        });
      }

      return createdUser;
    });

    /* =========================
       SEND VERIFICATION EMAIL
    ========================= */

    await sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
