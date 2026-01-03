// middleware.ts

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Store routes - only store managers can access
    if (pathname.startsWith("/dashboard/store") && token?.role !== "STORE_MANAGER") {
      return NextResponse.redirect(new URL("/auth/store/signin", req.url))
    }

    // Customer routes - only customers can access
    if (pathname.startsWith("/dashboard/customer") && token?.role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ["/dashboard/:path*"]
}