//src/app/schedule/page.tsx

'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Store = {
  id: string;
  name: string;
  city: string;
  categories: string[];
};

export default function SchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    numberOfVisitors: 1,
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/customer/signin');
      return;
    }

    if (status === 'authenticated') {
      loadStores();
    }
  }, [status, router]);

  async function loadStores() {
    try {
      const res = await fetch('/api/stores');
      if (res.ok) {
        const data = await res.json();
        setStores(data);
      }
    } catch (error) {
      console.error('Failed to load stores', error);
    } finally {
      setLoading(false);
    }
  }

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: name === 'numberOfVisitors' ? parseInt(value) : value,
    }));
  };

  const handleStoreSelect = (storeId: string) => {
    setSelectedStoreId(storeId);
    setShowForm(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: selectedStoreId,
          scheduledDate: bookingData.date,
          scheduledTime: bookingData.time,
          numberOfPeople: bookingData.numberOfVisitors,
        }),
      });

      if (res.ok) {
        const visit = await res.json();
        router.push(`/visits/${visit.id}`);
      }
    } catch (error) {
      console.error('Error booking visit:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule a Visit</h1>
      <p className="text-gray-600 mb-8">Select a store and schedule your visit</p>

      {/* Store Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Store</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => handleStoreSelect(store.id)}
              className={`border rounded-lg p-4 text-left hover:border-blue-500 transition-colors ${
                selectedStoreId === store.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <h3 className="font-semibold text-gray-900">{store.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{store.city}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {store.categories.slice(0, 2).map((cat, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {cat}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Booking Form */}
      {showForm && selectedStoreId && (
        <div className="border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule Your Visit</h2>
          
          <form onSubmit={handleBookingSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={bookingData.date}
                onChange={handleBookingChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                name="time"
                value={bookingData.time}
                onChange={handleBookingChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Visitors *
              </label>
              <select
                name="numberOfVisitors"
                value={bookingData.numberOfVisitors}
                onChange={handleBookingChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'person' : 'people'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Schedule Visit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}