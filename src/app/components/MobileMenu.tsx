//src/app/components/MobileMenu.tsx

'use client';

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 h-14">
         <Link
  href="/"
  className="flex items-center gap-2 font-semibold text-lg text-gray-900"
  onClick={() => setOpen(false)}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h5m4 0h5a1 1 0 001-1V10"
    />
  </svg>
  BondOutfit
</Link>


          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40">
          <div className="absolute top-14 left-0 right-0 bg-white shadow-md">
            <nav className="flex flex-col divide-y">
              <Link
                href="/"
                className="px-6 py-4"
                onClick={() => setOpen(false)}
              >
                Home
              </Link>

              <Link
                href="/auth/customer/signin"
                className="px-6 py-4"
                onClick={() => setOpen(false)}
              >
                Customer Sign in
              </Link>

              <Link
                href="/auth/store/signin"
                className="px-6 py-4"
                onClick={() => setOpen(false)}
              >
                Store Manager Sign in
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
