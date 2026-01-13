//src/app/dashboard/customer/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

type Store = {
  id: string;
  name: string;
  city: string;
  country: string;
  categories: string[];
  logoUrl?: string;
};

type Visit = {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  numberOfPeople: number;
  notes?: string;
  store: Store;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type VisitStats = {
  scheduled: number;
  completed: number;
  cancelled: number;
  total: number;
};

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State for booking modal
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    numberOfVisitors: 1,
    notes: '',
  });

  // New state for visits
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [visitStats, setVisitStats] = useState<VisitStats>({
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
  if (status === 'unauthenticated') {
    router.push('/auth/customer/signin');
    return;
  }
  
  // Check if user has CUSTOMER role
  if (status === 'authenticated' && session?.user?.role !== 'CUSTOMER') {
    // Store manager trying to access customer dashboard - redirect them
    if (session?.user?.role === 'STORE_MANAGER') {
      router.push('/dashboard/store');
    } else if (session?.user?.role === 'ADMIN') {
      router.push('/dashboard/admin');
    } else {
      router.push('/auth/customer/signin');
    }
    return;
  }
}, [status, session, router]);

  useEffect(() => {
  // Only load data if user is authenticated AND is a CUSTOMER
  if (status === 'authenticated' && session?.user?.role === 'CUSTOMER') {
    loadStores();
    loadVisits();
  }
}, [status, statusFilter]);

  async function loadStores() {
    setLoadingStores(true);
    try {
      const res = await fetch('/api/stores');
      if (res.ok) {
        const data = await res.json();
        setStores(data);
      }
    } catch (error) {
      console.error('Failed to load stores', error);
    } finally {
      setLoadingStores(false);
    }
  }

  async function loadVisits() {
    setLoadingVisits(true);
    try {
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await fetch(`/api/customer/visits${query}`);
      if (res.ok) {
        const data = await res.json();
        console.log('API Response:', data); // Add this for debugging
        setVisits(data.visits || []);
        calculateStats(data.visits || []);
      } else {
        console.error('Failed to load visits:', res.status);
      }
    } catch (error) {
      console.error('Failed to load visits', error);
    } finally {
      setLoadingVisits(false);
    }
  }

  function calculateStats(visitsList: Visit[]) {
    const stats: VisitStats = {
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      total: visitsList.length,
    };

    visitsList.forEach(visit => {
      if (visit.status === 'scheduled') {
        // Check if scheduled visit is upcoming or past
        const visitDate = new Date(`${visit.scheduledDate}T${visit.scheduledTime}`);
        if (visitDate >= new Date()) {
          stats.scheduled++;
        }
      } else {
        stats[visit.status as keyof VisitStats]++;
      }
    });

    setVisitStats(stats);
  }

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: name === 'numberOfVisitors' ? parseInt(value) : value,
    }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStoreId) {
      alert('Please select a store first');
      return;
    }

    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: selectedStoreId,
          scheduledDate: bookingData.date,
          scheduledTime: bookingData.time,
          numberOfPeople: bookingData.numberOfVisitors,
          notes: bookingData.notes,
        }),
      });

      if (res.ok) {
        const visit = await res.json();
        setShowBookingForm(false);
        setSelectedStoreId('');
        setBookingData({
          date: '',
          time: '',
          numberOfVisitors: 1,
          notes: '',
        });
        // Reload visits to show the new one
        loadVisits();
        router.push(`/visits/${visit.id}`);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to schedule visit');
      }
    } catch (error) {
      console.error('Error booking visit:', error);
      alert('Failed to schedule visit. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'missed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (visit: Visit) => {
    if (visit.status === 'scheduled') {
      const visitDate = new Date(`${visit.scheduledDate}T${visit.scheduledTime}`);
      if (visitDate < new Date()) {
        return 'Past due';
      }
    }
    return visit.status.charAt(0).toUpperCase() + visit.status.slice(1);
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(`${date}T${time}`);
      return format(dateObj, 'MMM d, yyyy • h:mm a');
    } catch {
      return `${date} at ${time}`;
    }
  };

  if (status === 'loading') {
  return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
}

// Check if user is not a customer (after loading)
if (status === 'authenticated' && session?.user?.role !== 'CUSTOMER') {
  return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Scheduled Visits</h3>
              <p className="text-3xl font-bold text-blue-600">{visitStats.scheduled}</p>
              <p className="text-gray-600 text-sm mt-2">Upcoming store visits</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Completed</h3>
              <p className="text-3xl font-bold text-green-600">{visitStats.completed}</p>
              <p className="text-gray-600 text-sm mt-2">Past visits</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Cancelled</h3>
              <p className="text-3xl font-bold text-red-600">{visitStats.cancelled}</p>
              <p className="text-gray-600 text-sm mt-2">Cancelled visits</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Visits</h3>
              <p className="text-3xl font-bold text-purple-600">{visitStats.total}</p>
              <p className="text-gray-600 text-sm mt-2">All visits</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Schedule Visit & Visits List */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule a New Visit</h2>
                <p className="text-gray-600 mb-6">
                  Book an appointment with a store to unlock exclusive discounts. Let the store know what you're interested in.
                </p>
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Schedule Visit
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">My Scheduled Visits</h2>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Visits</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="past">Past</option>
                    </select>
                    <button
                      onClick={() => router.push('/dashboard/customer/visits')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                </div>

                {loadingVisits ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading visits...</p>
                  </div>
                ) : visits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No visits found.</p>
                    <button
                      onClick={() => setShowBookingForm(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Schedule your first visit →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visits.slice(0, 5).map((visit) => (
                      <Link
                        key={visit.id}
                        href={`/visits/${visit.id}`}
                        className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                                {visit.store.name}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                                {getStatusDisplay(visit)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-1">
                              {formatDateTime(visit.scheduledDate, visit.scheduledTime)}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {visit.store.city}, {visit.store.country}
                              {visit.numberOfPeople > 1 && ` • ${visit.numberOfPeople} people`}
                            </p>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        
                        {visit.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600 line-clamp-2">{visit.notes}</p>
                          </div>
                        )}
                      </Link>
                    ))}

                    {visits.length > 5 && (
                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={() => router.push('/dashboard/customer/visits')}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View all {visits.length} visits →
                        </button>
                      </div>
                    )}
                  </div>
                )}
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

      {/* Booking Form Modal - Keep your existing modal code here */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Schedule a New Visit</h3>
              <button
                onClick={() => {
                  setShowBookingForm(false);
                  setSelectedStoreId('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Store Selection */}
            {!selectedStoreId ? (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Select a Store</h4>
                {loadingStores ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading stores...</p>
                  </div>
                ) : stores.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No stores available at the moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => setSelectedStoreId(store.id)}
                        className="border border-gray-300 rounded-lg p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <h5 className="font-semibold text-gray-900">{store.name}</h5>
                        <p className="text-sm text-gray-600 mt-1">{store.city}, {store.country}</p>
                        {store.categories?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {store.categories.slice(0, 2).map((cat: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Visit Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  </div>

                  <div className="mb-4">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={bookingData.notes}
                      onChange={handleBookingChange}
                      placeholder="Let the store know what you're interested in..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-32"
                      rows={4}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Tell the store about your interests, preferred styles, or any specific items you're looking for.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setSelectedStoreId('')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ← Change Store
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBookingForm(false);
                        setSelectedStoreId('');
                      }}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Schedule Visit
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}