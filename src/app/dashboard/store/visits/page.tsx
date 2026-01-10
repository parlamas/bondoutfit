//src/app/dashboard/store/visits/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';

type Visit = {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  numberOfPeople: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  checkedIn: boolean;
  checkedInAt: string | null;
  customerNotes: string | null;
  discountUnlocked: boolean;
  discountUsed: boolean;
  user: {
    name: string;
    email: string;
  };
};

export default function StoreVisitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('upcoming');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/store/signin');
      return;
    }

    if (status === 'authenticated' && (session?.user as any)?.role !== 'STORE_MANAGER') {
      router.replace('/');
      return;
    }

    if (status === 'authenticated') {
      loadVisits();
    }
  }, [status, session, router]);

  async function loadVisits() {
    try {
      const res = await fetch('/api/store/visits');
      if (res.ok) {
        const data = await res.json();
        setVisits(data);
      }
    } catch (error) {
      console.error('Failed to load visits', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateVisitStatus(visitId: string, status: string) {
    setUpdatingStatus(visitId);
    try {
      const res = await fetch(`/api/store/visits/${visitId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        await loadVisits();
      }
    } catch (error) {
      console.error('Failed to update visit status', error);
    } finally {
      setUpdatingStatus(null);
    }
  }

  async function checkInVisit(visitId: string) {
    setUpdatingStatus(visitId);
    try {
      const res = await fetch(`/api/store/visits/${visitId}/check-in`, {
        method: 'POST',
      });

      if (res.ok) {
        await loadVisits();
      }
    } catch (error) {
      console.error('Failed to check in visit', error);
    } finally {
      setUpdatingStatus(null);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'MISSED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'SCHEDULED': return <ClockIcon className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'MISSED': return <XCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  function formatTime(dateTimeString: string | null) {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  const filteredVisits = visits.filter(visit => {
    const visitDate = new Date(visit.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'today':
        return visitDate.toDateString() === today.toDateString();
      case 'upcoming':
        return visitDate >= today && visit.status === 'SCHEDULED';
      case 'past':
        return visitDate < today || ['COMPLETED', 'MISSED'].includes(visit.status);
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading visits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Visit Schedule</h1>
        <p className="text-gray-600 mt-2">Manage customer appointments and check-ins</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">
                {visits.filter(v => v.status === 'SCHEDULED').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {visits.filter(v => v.status === 'COMPLETED').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-purple-600">
                {visits.filter(v => {
                  const visitDate = new Date(v.scheduledDate);
                  const today = new Date();
                  return visitDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Visits
          </button>
        </div>
      </div>

      {/* Visits List */}
      {filteredVisits.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
          <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No visits found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {filter === 'today'
              ? 'No visits scheduled for today'
              : filter === 'upcoming'
              ? 'No upcoming visits scheduled'
              : 'No visits found for the selected filter'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredVisits.map((visit) => (
            <div key={visit.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(visit.status)}`}>
                      {getStatusIcon(visit.status)}
                      {visit.status}
                    </span>
                    {visit.checkedIn && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Checked In
                      </span>
                    )}
                    {visit.discountUnlocked && !visit.discountUsed && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Discount Available
                      </span>
                    )}
                    {visit.discountUsed && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Discount Used
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">Date & Time</span>
                      </div>
                      <p className="text-gray-900">
                        {formatDate(visit.scheduledDate)} at {visit.scheduledTime}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Group Size</span>
                      </div>
                      <p className="text-gray-900">
                        {visit.numberOfPeople} {visit.numberOfPeople === 1 ? 'person' : 'people'}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <span className="text-sm font-medium">Customer</span>
                      </div>
                      <p className="text-gray-900 font-medium">{visit.user.name}</p>
                      <p className="text-gray-600 text-sm">{visit.user.email}</p>
                    </div>
                  </div>

                  {visit.customerNotes && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-1">Customer Notes</div>
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                        {visit.customerNotes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  {visit.status === 'SCHEDULED' && !visit.checkedIn && (
                    <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg w-64">
                      <p className="text-sm text-yellow-800 font-medium">
                        📍 Scan customer's QR code when they arrive
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Scanning will automatically check them in and unlock discounts
                      </p>
                    </div>
                  )}

                  {visit.checkedIn && visit.status === 'SCHEDULED' && (
                    <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg w-64">
                      <p className="text-sm text-green-800 font-medium">
                        ✅ Customer checked in at {formatTime(visit.checkedInAt)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Scan QR code again when they leave to mark as completed
                      </p>
                    </div>
                  )}

                  {/* Only keep Cancel button (others are automated) */}
                  {visit.status === 'SCHEDULED' && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this visit?')) {
                          updateVisitStatus(visit.id, 'CANCELLED');
                        }
                      }}
                      disabled={updatingStatus === visit.id}
                      className="mt-3 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 w-full"
                    >
                      {updatingStatus === visit.id ? 'Cancelling...' : 'Cancel Visit'}
                    </button>
                  )}
                </div>
              </div>

              {visit.checkedInAt && (
                <div className="pt-4 mt-4 border-t border-gray-100 text-sm text-gray-500">
                  Checked in at: {new Date(visit.checkedInAt).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}