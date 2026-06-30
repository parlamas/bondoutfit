//app/dashboard/customer/visits/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Calendar, MapPin, XCircle, ArrowLeft } from 'lucide-react';

type Visit = {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  numberOfPeople: number;
  notes?: string;
  inspirationImages: string[];
  store: {
    id: string;
    name: string;
    city: string;
    country: string;
  };
};

export default function CustomerVisitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
    if (status === 'authenticated' && session?.user?.role === 'CUSTOMER') {
      loadVisits();
    }
  }, [status, statusFilter]);

  async function loadVisits() {
    setLoading(true);
    try {
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await fetch(`/api/customer/visits${query}`);
      if (res.ok) {
        const data = await res.json();
        setVisits(data.visits || []);
      }
    } catch (error) {
      console.error('Failed to load visits', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(`${date}T${time}`);
      return format(dateObj, 'MMM d, yyyy • h:mm a');
    } catch {
      return `${date} at ${time}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'missed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => router.push('/dashboard/customer')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">All My Visits</h1>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
            >
              <option value="all">All Visits</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="missed">Missed</option>
            </select>
          </div>

          {visits.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No visits found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map((visit) => (
                <Link
                  key={visit.id}
                  href={`/visits/${visit.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{visit.store.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                      {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-1">
                    {formatDateTime(visit.scheduledDate, visit.scheduledTime)}
                  </p>
                  
                  <p className="text-gray-600 text-sm mb-2">
                    {visit.store.city}, {visit.store.country}
                    {visit.numberOfPeople > 1 && ` • ${visit.numberOfPeople} people`}
                  </p>

                  {/* Customer Notes Preview */}
                  {visit.notes && (
                    <div className="mb-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span className="font-medium">Note:</span> {visit.notes.length > 50 
                        ? visit.notes.substring(0, 50) + '...' 
                        : visit.notes}
                    </div>
                  )}

                  {/* Inspiration Images Preview */}
                  {visit.inspirationImages && visit.inspirationImages.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {visit.inspirationImages.slice(0, 3).map((url, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 rounded border border-gray-200 overflow-hidden"
                        >
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {visit.inspirationImages.length > 3 && (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                          +{visit.inspirationImages.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}