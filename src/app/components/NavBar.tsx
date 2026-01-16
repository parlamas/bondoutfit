// src/app/components/NavBar.tsx - COMPLETE UPDATED VERSION WITH BOTH DASHBOARDS

"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Home } from "lucide-react";
import { usePathname } from "next/navigation";

export default function RoleBasedNavbar() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role as "CUSTOMER" | "STORE_MANAGER" | undefined;
  const pathname = usePathname();
  const isHome = pathname === "/";


  return (
    <header className="w-full border-b bg-white">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
  {/* LEFT */}
  <div className="hidden md:flex items-center gap-3">
    <Link
      href="/"
      className="rounded-md p-2 text-gray-800 hover:bg-gray-100"
      aria-label="Home"
    >
      <Home className="h-6 w-6" />
    </Link>

    <Link href="/" className="text-lg font-semibold text-gray-900">
      BondOutfit
    </Link>
  </div>

  {/* RIGHT */}
  <nav className="flex flex-wrap items-center gap-3">
    {status !== "authenticated" && isHome && (
      <>
        <Link
          href="/auth/customer/signin"
          className="rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Customer Sign In
        </Link>

        <Link
          href="/auth/store/signin"
          className="rounded-md border px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
        >
          Store Sign In
        </Link>
      </>
    )}

        {status !== "authenticated" && !isHome && !pathname.includes("/auth/") && (
      <Link
        href="/auth/customer/signin"
        className="rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Sign in
      </Link>
    )}

    {status === "authenticated" && (
      <>
        {role === "STORE_MANAGER" && (
          <Link
            href="/dashboard/store"
            className="rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Store Dashboard
          </Link>
        )}
        
        {role === "CUSTOMER" && (
          <Link
            href="/dashboard/customer"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            My Visits
          </Link>
        )}
        
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Sign out
        </button>
      </>
    )}
  </nav>
</div>

</header>

  );
}