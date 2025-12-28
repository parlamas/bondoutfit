// src/app/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "../components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <p>Not signed in</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Customer Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Welcome to your SVD dashboard!
        </p>

        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Profile
          </h2>
          <p className="text-gray-900">Email: {session.user.email}</p>
          <p className="text-gray-900">Name: {session.user.name}</p>
          <p className="text-gray-900">
            Role: {(session.user as any).role}
          </p>

          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
