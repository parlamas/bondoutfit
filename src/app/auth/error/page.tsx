'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded">
            <p className="text-red-800 font-medium">Error: {error || 'Unknown error'}</p>
            <p className="text-red-600 text-sm mt-2">
              Please check the server logs for more details.
            </p>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link
            href="/auth/store/signin"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Return to Store Sign In
          </Link>
          <div>
            <Link
              href="/auth/customer/signin"
              className="text-blue-600 hover:text-blue-500"
            >
              Customer Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading error details...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}