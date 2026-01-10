//src/app/dashboard/customer/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/customer/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
            <div className="text-sm text-gray-600">
              Welcome, <span className="font-semibold">{session.user?.name}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Scheduled Visits</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-gray-600 text-sm mt-2">Upcoming store visits</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Available Discounts</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-gray-600 text-sm mt-2">Unlocked discounts</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Favorite Stores</h3>
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-gray-600 text-sm mt-2">Saved stores</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Schedule Visit */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule a New Visit</h2>
                <p className="text-gray-600 mb-6">
                  Book an appointment with a store to unlock exclusive discounts. Let the store know what you're interested in.
                </p>
                <button
                  onClick={() => router.push('/stores')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Schedule Visit
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">My Scheduled Visits</h2>
                <div className="text-center py-8 text-gray-500">
                  <p>No scheduled visits yet.</p>
                  <button
                    onClick={() => router.push('/stores')}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Schedule your first visit →
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Preferences & Profile */}
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">My Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Clothing Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Casual Wear</span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Formal Wear</span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Sportswear</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Size Preferences</h3>
                    <p className="text-gray-600">Not specified yet</p>
                  </div>

                  <button
                    onClick={() => router.push('/dashboard/customer/preferences')}
                    className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    Edit Preferences
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/dashboard/customer/visits')}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                  >
                    <span className="font-medium text-gray-800">View All Visits</span>
                    <p className="text-sm text-gray-600">See your scheduled and past visits</p>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/customer/discounts')}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                  >
                    <span className="font-medium text-gray-800">My Discounts</span>
                    <p className="text-sm text-gray-600">Available and used discounts</p>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/customer/profile')}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                  >
                    <span className="font-medium text-gray-800">Edit Profile</span>
                    <p className="text-sm text-gray-600">Update personal information</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}