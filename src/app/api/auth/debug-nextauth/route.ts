import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Test getting session
    const session = await getServerSession(authOptions);
    
    // Test auth options
    const options = {
      hasProviders: !!authOptions.providers,
      providerCount: authOptions.providers?.length || 0,
      hasSecret: !!authOptions.secret,
      sessionStrategy: authOptions.session?.strategy,
      pages: authOptions.pages,
    };

    return NextResponse.json({
      success: true,
      session: session 
        ? { user: { id: session.user.id, email: session.user.email, role: (session.user as any).role } }
        : null,
      options,
      rawSession: session, // For debugging
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      details: 'NextAuth configuration error',
    }, { status: 500 });
  }
}