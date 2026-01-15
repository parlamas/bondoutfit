// src/app/api/auth/signup/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const normalizeInt = (value: any) => {
  if (value === "" || value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const normalizeText = (value: any) => {
  if (value === "" || value === undefined || value === null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
};


    console.log("📦 SIGNUP PAYLOAD:", body);

    /* =========================
       EXTRACT (NO MAGIC)
    ========================= */

    const email = body.email?.trim();
    const password = body.password;
    const name = body.name?.trim();
    const role = body.role;

const phoneCountry = normalizeText(body.phoneCountry);
const phoneArea = normalizeText(body.phoneArea);
const phoneNumber = body.phoneNumber?.trim();
const city = body.city?.trim();
const state = body.state?.trim();
const zip = body.zip?.trim();


const age = normalizeInt(body.age);
const gender = normalizeText(body.gender);
const heightCm = normalizeInt(body.heightCm);
const weightKg = normalizeInt(body.weightKg);
const occupation = normalizeText(body.occupation);


    const storeName = body.storeName?.trim();
    const country = body.country?.trim();
    const street = body.street?.trim();
    const streetNumber = body.streetNumber?.trim();
    const floor = body.floor ?? null;
    const categories = Array.isArray(body.categories) ? body.categories : [];

    console.log("🧪 VALIDATED FIELDS:", {
  email: email,
  name: name,
  role: role,
  phoneCountry: phoneCountry,
  phoneArea: phoneArea,
  phoneNumber: phoneNumber,
  city: city,
  state: state,
  zip: zip,
  storeName: storeName,
  country: country,
  street: street,
  streetNumber: streetNumber,
  categories: categories,
});


    /* =========================
       REQUIRED (ALL USERS)
    ========================= */

    if (
      !email ||
      !password ||
      !name ||
      !phoneNumber ||
      !city ||
      !state ||
      !zip
    ) {
      return NextResponse.json(
        { error: "Missing required personal information" },
        { status: 400 }
      );
    }

    /* =========================
       REQUIRED (STORE MANAGER)
    ========================= */

    if (role === "STORE_MANAGER") {
      if (!storeName || !country || !street || !streetNumber) {
        return NextResponse.json(
          { error: "Missing required store information" },
          { status: 400 }
        );
      }
    }

    /* =========================
       DUPLICATE CHECK
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
       PREP
    ========================= */

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomUUID();
    const verificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

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
            name: storeName!,
            email, // ADD THIS LINE - copies manager's email to store
            phoneCountry,
            phoneArea,
            phoneNumber,

            country: country!,
            city,
            state,
            zip,
            street: street!,
            streetNumber: streetNumber!,
            floor,
            categories,

            managerId: createdUser.id,
          },
        });
      }

      return createdUser;
    });

    /* =========================
       EMAIL
    ========================= */

    await sendVerificationEmail(user.email, verificationToken);

    console.log("✅ Signup successful:", user.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
