//src/lib/email.ts

import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  role: "CUSTOMER" | "STORE_MANAGER" | "ADMIN"
) {

  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}&type=${
        role === "STORE_MANAGER" || role === "ADMIN" ? "store" : "customer"
}`;

  
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
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: '"BondOutfit SVD" <noreply@bondoutfit.com>',
    to: email,
    subject: 'Verify your BondOutfit account',
    html: `
      <h2>Welcome to BondOutfit SVD!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
}// Force email function update 
