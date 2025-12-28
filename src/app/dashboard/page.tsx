//src/app/dashboard/page.tsx

import { auth } from "../../lib/auth";
import { signOut } from "@/lib/auth"; // Add this import

export default async function CustomerDashboard() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your SVD dashboard!</p>
        
        {session?.user ? (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
            <p className="text-gray-900">Email: {session.user.email}</p>
            <p className="text-gray-900">Name: {session.user.name}</p>
            <p className="text-gray-900">Role: {session.user.role}</p>
            
            {/* Add Sign Out Button */}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        ) : (
          <p>Not signed in</p>
        )}
      </div>
    </div>
  );
}