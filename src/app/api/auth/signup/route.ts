// src/app/api/auth/signup/route.ts

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

      // phone (shared)
      phoneCountry,
      phoneArea,
      phoneNumber,

      // shared required location
      city,
      state,
      zip,

      // customer-only (optional)
      age,
      gender,
      heightCm,
      weightKg,
      occupation,

      // store-only
      storeName,
      country,
      street,
      streetNumber,
      floor,
      categories,
    } = body;

    /* =========================
       BASIC VALIDATION (ALL USERS)
    ========================= */

    if (
      !email?.trim() ||
      !password ||
      !name?.trim() ||
      !phoneNumber?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !zip?.trim()
    ) {
      return NextResponse.json(
        { error: "Missing required personal information" },
        { status: 400 }
      );
    }

    /* =========================
       STORE-SPECIFIC VALIDATION
    ========================= */

    if (role === "STORE_MANAGER") {
      if (
        !storeName?.trim() ||
        !country?.trim() ||
        !street?.trim() ||
        !streetNumber?.trim()
      ) {
        return NextResponse.json(
          { error: "Missing required store information" },
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
       TRANSACTION (USER + STORE)
    ========================= */

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role,

          phoneCountry,
          phoneArea,
          phoneNumber,

          city,
          state,
          zip,

          age,
          gender,
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

            phoneCountry,
            phoneArea,
            phoneNumber,

            country,
            city,
            state,
            zip,
            street,
            streetNumber,
            floor,
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
