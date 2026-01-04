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
          <span className="font-semibold text-lg">
            BondOutfit
          </span>

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
