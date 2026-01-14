// src/app/auth/forgot-password/ForgotPasswordClient.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "customer";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Always show success (security)
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to home
        </Link>

        <h2 className="text-2xl font-bold text-gray-900">
          Reset your password
        </h2>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10 w-full border px-4 py-2 rounded"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 border border-green-200 p-4 rounded text-sm text-green-800">
            If an account exists for <strong>{email}</strong>, a reset link has
            been sent.
          </div>
        )}

                <p className="text-sm text-center text-gray-600">
          Remember your password?{" "}
          <Link
            href={type === "store" ? "/auth/store/signin" : "/auth/customer/signin"}
            className="text-blue-600 hover:underline"
          >
            Sign in
          </Link>
        </p>


      </div>
    </div>
  );
}
