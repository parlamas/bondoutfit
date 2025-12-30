// src/app/components/Navbar.tsx

"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b">
      <Link href="/" className="text-lg font-semibold">
        BondOutfit
      </Link>

      <div className="flex items-center gap-4">
        {/* Loading state */}
        {status === "loading" && null}

        {/* NOT signed in */}
        {!session && status === "unauthenticated" && (
  <>
    <Link href="/auth/signup?type=customer">Customer Sign Up</Link>
    <Link href="/auth/signin?type=customer">Customer Sign In</Link>

    <Link href="/auth/signup?type=store-manager">Store Sign Up</Link>
    <Link href="/auth/signin?type=store-manager">Store Manager Sign In</Link>
  </>
)}

        {/* CUSTOMER */}
        {session?.user && (session.user as any).role === "CUSTOMER" && (
          <>
            <Link href="/dashboard">My Dashboard</Link>
            <button onClick={() => signOut({ callbackUrl: "/" })}>
              Sign Out
            </button>
          </>
        )}

        {/* STORE MANAGER */}
        {session?.user && (session.user as any).role === "STORE_MANAGER" && (
          <>
            <Link href="/dashboard/store">Dashboard</Link>
            <button onClick={() => signOut({ callbackUrl: "/" })}>
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
