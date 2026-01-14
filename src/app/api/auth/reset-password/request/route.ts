//src/app/api/auth/reset-password/request/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'customer' } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "If an account exists, you will receive a reset email." },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpires: resetTokenExpires,
      },
    });

    // Convert type parameter to role
    const role = type === "store" ? "STORE_MANAGER" : "CUSTOMER";
    
    // MANUALLY create correct link (bypass broken email.ts cache)
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}&type=${type}`;
    
    // Send email with manually created link
    await transporter.sendMail({
      from: '"BondOutfit SVD" <noreply@bondoutfit.com>',
      to: email,
      subject: 'Reset your BondOutfit password',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your BondOutfit account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return NextResponse.json(
      { message: "Password reset email sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}