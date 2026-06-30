//app/dashboard/customer/preferences/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

export default function CustomerPreferencesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    clothingInterests: [] as string[],
    sizePreferences: '',
    notifications: true,
  });

  const clothingOptions = [
    'Casual Wear',
    'Formal Wear',
    'Sportswear',
    'Traditional Wear',
    'Accessories',
    'Footwear',
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/customer/signin');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'CUSTOMER') {
      router.push('/dashboard/store');
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      const res = await fetch('/api/user/preferences');
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences || preferences);
      }
    } catch (error) {
      console.error('Failed to load preferences', error);
    }
  }

  const toggleInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      clothingInterests: prev.clothingInterests.includes(interest)
        ? prev.clothingInterests.filter(i => i !== interest)
        : [...prev.clothingInterests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      
      if (res.ok) {
        alert('Preferences saved successfully');
      } else {
        alert('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <button
          onClick={() => router.push('/dashboard/customer')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Preferences</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Clothing Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {clothingOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleInterest(option)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      preferences.clothingInterests.includes(option)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size Preferences
              </label>
              <input
                type="text"
                value={preferences.sizePreferences}
                onChange={(e) => setPreferences({ ...preferences, sizePreferences: e.target.value })}
                placeholder="e.g., Medium, Large, 32x34, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notifications"
                checked={preferences.notifications}
                onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="notifications" className="text-sm text-gray-700">
                Receive email notifications about new stores and discounts
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}