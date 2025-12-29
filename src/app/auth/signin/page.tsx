//src/app/auth/signin/page.tsx

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthSection from "../../components/AuthSection";

export const dynamic = "force-dynamic";

function SignInContent() {
  const searchParams = useSearchParams();

  const verifySent = searchParams.get("verify") === "sent";
  const error = searchParams.get("error");

  // SINGLE SOURCE OF TRUTH
  const typeParam = searchParams.get("type");
  const modeParam = searchParams.get("mode");

  // SAFE DEFAULT (no crashes)
  const type =
    typeParam === "store-manager" ? "store-manager" : "customer";

  const isSignUp = modeParam === "signup";

  return (
    <div className="max-w-md mx-auto mt-12">
      {verifySent && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          <strong>Check your email.</strong>
          <br />
          We’ve sent you a verification email. Please verify your account before
          signing in.
        </div>
      )}

      {error === "CredentialsSignin" && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Invalid email or password.
        </div>
      )}

      {error === "EmailNotVerified" && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          Your email is not verified. Please check your inbox.
        </div>
      )}

      <AuthSection type={type} defaultSignUp={isSignUp} />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}
