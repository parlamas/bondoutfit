// src/app/api/debug/route.ts

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Set" : "Missing",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "Missing",
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "Set" : "Missing",
    DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Missing",
    nodeEnv: process.env.NODE_ENV,
    vercelUrl: process.env.VERCEL_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
  });
}

