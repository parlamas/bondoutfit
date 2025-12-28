//src/app/dashboard/store/page.tsx

import { auth } from "../../../lib/auth";
import SignOutButton from "../../components/SignOutButton";

export const dynamic = 'force-dynamic';

export default async function StoreManagerDashboard() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Store Manager Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your SVD offers and scheduled visits.</p>
        
        {session?.user ? (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900">Your Store Profile</h2>
            <p className="text-gray-900">Email: {session.user.email}</p>
            <p className="text-gray-900">Name: {session.user.name}</p>
            <p className="text-gray-900">Role: {session.user.role}</p>
            
            {/* Add Sign Out Button */}
            <SignOutButton />
          </div>
        ) : (
          <p>Not signed in</p>
        )}
      </div>
    </div>
  );
}



