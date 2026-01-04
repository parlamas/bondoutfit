// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import NavBar from "./components/NavBar";
import MobileMenu from "./components/MobileMenu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BondOutfit - Scheduled Visit Discount (SVD)",
  description:
    "Schedule store visits and get exclusive discounts with our SVD platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NavBar />
          <MobileMenu />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
