export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  return Response.json({
    message: "BondOutfit API is working",
    authStatus: {
      apiAvailable: true,
      config: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "Not set",
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV,
      },
      cookieDomain: process.env.NODE_ENV === 'production' ? '.bondoutfit.com' : 'localhost',
    },
    requestInfo: {
      hostname: url.hostname,
      origin: url.origin,
      pathname: url.pathname,
    },
    timestamp: new Date().toISOString(),
    nextSteps: [
      "Visit /auth/signin for login",
      "Visit /api/auth/signin for auth API",
      "Check browser console for errors",
    ],
  });
}
