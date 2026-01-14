// src/lib/auth.ts

import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  // Use NEXTAUTH_URL for production, fallback for development
  secret: process.env.NEXTAUTH_SECRET,
  
  // Important: Set the base URL for production

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        expectedRole: { label: "Role", type: "text" },
      },

      async authorize(credentials) {
  console.log('=== AUTH DEBUG START ===');
  console.log('=== PASSWORD RESET DEBUG ===');
  console.log('Full credentials object:', credentials);
  console.log('Email:', credentials?.email);
  console.log('Expected role from form:', credentials?.expectedRole);
        console.log('Credentials received:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          expectedRole: credentials?.expectedRole
        });

        if (!credentials?.email || !credentials?.password || !credentials?.expectedRole) {
          console.log('Missing credentials');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        console.log('Database user found:', {
          exists: !!user,
          email: user?.email,
          role: user?.role,
          hasPassword: !!user?.password,
          emailVerified: user?.emailVerified,
          passwordLength: user?.password?.length
        });

        if (!user || !user.password) {
          console.log('User not found or no password');
          return null;
        }

        if (user.emailVerified === null) {
          console.log('Email not verified');
          throw new Error("EmailNotVerified");
        }

        console.log('Checking role:', {
          userRole: user.role,
          expectedRole: credentials.expectedRole
        });

        if (user.role !== credentials.expectedRole) {
          console.log('ROLE MISMATCH - throwing InvalidRole');
          throw new Error("InvalidRole");
        }

        console.log('Comparing password...');
        const valid = await compare(credentials.password, user.password);
        console.log('Password valid:', valid);

        if (!valid) {
          console.log('Password invalid');
          return null;
        }

        console.log('=== AUTH DEBUG END - SUCCESS ===');
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },

  pages: {
  signIn: "/auth/customer/signin", // Default
  error: "/auth/error",
},
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Debug logs for production
  debug: process.env.NODE_ENV === "development",
};

// helpers
export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function comparePassword(password: string, hashed: string) {
  return compare(password, hashed);
}