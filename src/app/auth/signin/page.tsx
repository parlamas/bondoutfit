//src/app/auth/signin/page.tsx

"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import AuthSection from "../../components/AuthSection";

export default function SignInPage() {
  return (
    <div className="max-w-md mx-auto mt-12">
      <Suspense fallback={null}>
        <SignInContent />
      </Suspense>

      <AuthSection type="customer" />
    </div>
  );
}

import { useSearchParams } from "next/navigation";

function SignInContent() {
  const searchParams = useSearchParams();
  const verifySent = searchParams.get("verify") === "sent";

  if (!verifySent) return null;

  return (
    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
      <strong>Check your email.</strong>
      <br />
      We’ve sent you a verification email. Please verify your account before signing in.
    </div>
  );
}

