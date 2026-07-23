// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import NavBar from "./components/NavBar";
import MobileMenu from "./components/MobileMenu";
import { Analytics } from "@vercel/analytics/next";
import WhatsAppButton from '@/components/WhatsAppButton';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BondOutfit - Scheduled Visit Discount (SVD)",
  description:
    "Schedule store visits and get exclusive discounts with our SVD platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <div className="sticky top-0 z-50 bg-white">
              <div className="flex justify-end px-4 py-2 border-b">
                <LanguageSwitcher />
              </div>
              <NavBar />
            </div>
            <MobileMenu />
            {children}
          </AuthProvider>
          <Analytics />
          <WhatsAppButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


