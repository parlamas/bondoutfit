// src/lib/auth.ts

import NextAuth, { type AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { prisma } from "./prisma";

const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  
  // For custom domain on Vercel
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true, // Always true for production
        // Important: Set domain for custom domain
        domain: process.env.NODE_ENV === 'production' 
          ? '.bondoutfit.com' // Note the leading dot for subdomains
          : undefined,
      },
    },
  },
  
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
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in.");
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
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
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  debug: process.env.NODE_ENV === "development",
};

// ✅ STANDARD NEXTAUTH v4 EXPORT PATTERN
export default NextAuth(authOptions);

// Manually extract and export methods
const nextAuthInstance = NextAuth(authOptions);
export const auth = nextAuthInstance.auth;
export const signIn = nextAuthInstance.signIn;
export const signOut = nextAuthInstance.signOut;
export const handlers = nextAuthInstance.handlers;

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}