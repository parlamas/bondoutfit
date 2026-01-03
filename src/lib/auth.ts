// src/lib/auth.ts

import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  // Use NEXTAUTH_URL for production, fallback for development
  secret: process.env.NEXTAUTH_SECRET,
  
  // Important: Set the base URL for production
  ...(process.env.NEXTAUTH_URL && { 
    basePath: "/api/auth",
    baseUrl: process.env.NEXTAUTH_URL 
  }),

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        if (!user.emailVerified) {
          throw new Error("EmailNotVerified");
        }

        const valid = await compare(credentials.password, user.password);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
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

    async redirect({ url, baseUrl }) {
      // Fix: Handle both development and production URLs
      const allowedBaseUrl = process.env.NEXTAUTH_URL || baseUrl;
      
      // Allow relative URLs
      if (url.startsWith("/")) return `${allowedBaseUrl}${url}`;
      
      // Allow same-origin URLs
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === allowedBaseUrl) return url;
      } catch {
        // Invalid URL, fallback to baseUrl
      }
      
      // Default redirect to dashboard based on role
      return `${allowedBaseUrl}/dashboard`;
    },
  },

  pages: {
    // IMPORTANT: This needs to match your actual sign-in page
    signIn: "/auth/store/signin", // Changed from "/auth/signin"
    error: "/auth/store/signin", // Changed from "/auth/signin"
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