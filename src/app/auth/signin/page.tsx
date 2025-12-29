// src/app/auth/signin/page.tsx

"use client";

import { useSession } from "next-auth/react";
import { useSearchParams, redirect } from "next/navigation";
import AuthSection from "../../components/AuthSection";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  // ⏳ Wait until session is resolved
  if (status === "loading") {
    return null;
  }

  // 🔁 Redirect already-authenticated users
  if (session?.user) {
    if ((session.user as any).role === "STORE_MANAGER") {
      redirect("/dashboard/store");
    }
    redirect("/dashboard");
  }

  const verifySent = searchParams.get("verify") === "sent";
  const error = searchParams.get("error");

  return (
    <div className="max-w-md mx-auto mt-12 bg-white text-gray-900 p-6 rounded-xl shadow">
      {/* Email verification notice */}
      {verifySent && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          <strong>Check your email.</strong>
          <br />
          We’ve sent you a verification email. Please verify your account before
          signing in.
        </div>
      )}

      {/* Auth errors */}
      {error === "CredentialsSignin" && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Invalid email or password.
        </div>
      )}

      {error === "EmailNotVerified" && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          Your email is not verified. Please check your inbox and verify your
          account.
        </div>
      )}

      <AuthSection type="customer" />
    </div>
  );
}
