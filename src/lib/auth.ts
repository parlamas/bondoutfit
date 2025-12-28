// src/lib/auth.ts

import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

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
          throw new Error("Please verify your email before logging in.");
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
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },

  session: {
    strategy: "jwt",
  },
};

// helpers
export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function comparePassword(password: string, hashed: string) {
  return compare(password, hashed);
}
