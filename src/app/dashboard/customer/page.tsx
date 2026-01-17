// src/app/dashboard/customer/page.tsx - WITH BOTH INDIVIDUAL & BULK CANCELLATION

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { XCircle, AlertCircle, Calendar, Users, MapPin, X, Clock, CheckCircle, Ban, MoreVertical, Edit, Trash2, Info } from 'lucide-react';


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
  
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [visitStats, setVisitStats] = useState<VisitStats>({
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  // Bulk cancellation states
  const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
  const [eligibleVisits, setEligibleVisits] = useState<Visit[]>([]);
  const [upcomingVisits, setUpcomingVisits] = useState<Visit[]>([]);
  const [loadingEligibility, setLoadingEligibility] = useState(false);

  // Individual cancellation states
  const [cancellingVisitId, setCancellingVisitId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

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
      loadVisits();
      checkBulkCancelEligibility();
    }
  }, [status, statusFilter]);

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
        
        // Filter upcoming visits
        const upcoming = (data.visits || []).filter((visit: Visit) => {
          if (visit.status !== 'scheduled') return false;
          const visitDate = new Date(`${visit.scheduledDate}T${visit.scheduledTime}`);
          return visitDate >= new Date();
        });
        setUpcomingVisits(upcoming);
      } else {
        console.error('Failed to load visits:', res.status);
      }
    } catch (error) {
      console.error('Failed to load visits', error);
    } finally {
      setLoadingVisits(false);
    }
  }

  async function checkBulkCancelEligibility() {
    setLoadingEligibility(true);
    try {
      const res = await fetch('/api/visits/cancel-all');
      if (res.ok) {
        const data = await res.json();
        if (data.eligibleVisits && data.eligibleVisits.length > 0) {
          // Map eligible visits to match our Visit type
          setEligibleVisits(data.eligibleVisits.map((ev: any) => ({
            id: ev.id,
            scheduledDate: ev.scheduledDate,
            scheduledTime: ev.scheduledTime,
            status: 'scheduled' as const,
            numberOfPeople: ev.numberOfPeople || 1,
            store: {
              id: '',
              name: ev.storeName || 'Unknown Store',
              city: ev.location?.split(',')[0] || '',
              country: ev.location?.split(',')[1]?.trim() || '',
              categories: []
            },
            userId: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })));
        } else {
          setEligibleVisits([]);
        }
      }
    } catch (error) {
      console.error('Failed to check bulk cancellation eligibility:', error);
    } finally {
      setLoadingEligibility(false);
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

  // INDIVIDUAL CANCELLATION FUNCTIONS
  const handleCancelVisitClick = (visit: Visit) => {
    setSelectedVisit(visit);
    setCancelReason('');
    setShowCancelModal(true);
    setActionMenuOpen(null);
  };

  const handleIndividualCancel = async () => {
    if (!selectedVisit || !cancelReason.trim()) return;

    setCancellingVisitId(selectedVisit.id);
    try {
      const res = await fetch(`/api/visits/${selectedVisit.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Visit cancelled successfully!');
        setShowCancelModal(false);
        setSelectedVisit(null);
        setCancelReason('');
        loadVisits(); // Refresh data
        checkBulkCancelEligibility(); // Update eligibility
      } else {
        alert(`Failed to cancel visit: ${data.error}`);
      }
    } catch (error) {
      console.error('Error cancelling visit:', error);
      alert('An error occurred while cancelling the visit');
    } finally {
      setCancellingVisitId(null);
    }
  };

  const handleEditVisit = (visitId: string) => {
    router.push(`/visits/${visitId}`);
    setActionMenuOpen(null);
  };

  const isVisitEligibleForCancellation = (visit: Visit) => {
    if (visit.status !== 'scheduled') return false;
    
    const visitDate = new Date(`${visit.scheduledDate}T${visit.scheduledTime}`);
    const now = new Date();
    const timeDiff = visitDate.getTime() - now.getTime();
    const hoursUntilVisit = timeDiff / (1000 * 60 * 60);
    
    return hoursUntilVisit >= 1;
  };

  const handleBulkCancellationSuccess = () => {
    // Refresh data
    loadVisits();
    checkBulkCancelEligibility();
    setShowBulkCancelModal(false);
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

  // Add this function inside your CustomerDashboard component:

const BulkCancelModal = ({ visits, onClose, onSuccess }: any) => {
  const [reason, setReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(`${date}T${time}`);
      return format(dateObj, 'MMM d, yyyy • h:mm a');
    } catch {
      return `${date} at ${time}`;
    }
  };

  const handleBulkCancel = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    setCancelling(true);
    setError(null);

    try {
      const res = await fetch('/api/visits/cancel-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Successfully cancelled ${data.cancelledCount} visit(s)!`);
        if (data.skippedCount > 0) {
          alert(`ℹ️ ${data.skippedCount} visit(s) could not be cancelled`);
        }
        onSuccess();
      } else {
        setError(data.error || 'Failed to cancel visits');
      }
    } catch (error) {
      console.error('Error bulk cancelling:', error);
      setError('An error occurred while cancelling visits');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Cancel All Upcoming Visits</h3>
            <p className="text-gray-600 text-sm mt-1">
              This will cancel {visits.length} scheduled visit(s)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={cancelling}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium mb-2">Important Information</p>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• This will cancel ALL your upcoming visits</li>
                  <li>• Store managers will be notified of each cancellation</li>
                  <li>• Refunds are subject to each store's cancellation policy</li>
                  <li>• Once cancelled, visits cannot be reinstated automatically</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Visits to be cancelled ({visits.length}):
            </h4>
            <div className="border border-gray-200 rounded-lg divide-y max-h-60 overflow-y-auto">
              {visits.map((visit: any) => (
                <div key={visit.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900">{visit.store.name}</div>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {visit.numberOfPeople} {visit.numberOfPeople === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(visit.scheduledDate, visit.scheduledTime)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {visit.store.city}, {visit.store.country}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for cancelling all visits
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={cancelling}
            >
              <option value="">Select a reason...</option>
              <option value="Change of travel plans">Change of travel plans</option>
              <option value="Unexpected circumstances">Unexpected circumstances</option>
              <option value="Dissatisfied with service">Dissatisfied with service</option>
              <option value="Found better alternatives">Found better alternatives</option>
              <option value="Other">Other</option>
            </select>
            
            {reason === 'Other' && (
              <input
                type="text"
                placeholder="Please specify..."
                className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setReason(e.target.value)}
                disabled={cancelling}
              />
            )}
            
            {error && (
              <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">What happens next?</p>
                <ul className="mt-1 space-y-1">
                  <li>• Store managers will receive email notifications</li>
                  <li>• You'll receive a confirmation email summary</li>
                  <li>• Refunds will be processed per store policies</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={cancelling}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
            >
              Go Back
            </button>
            <button
              onClick={handleBulkCancel}
              disabled={cancelling || !reason.trim()}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {cancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  Cancel All ({visits.length}) Visits
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your store visits and preferences</p>
            </div>
            <div className="text-sm text-gray-600">
              Welcome, <span className="font-semibold">{session.user?.name}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Scheduled</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{visitStats.scheduled}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Upcoming store visits</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Completed</h3>
                  <p className="text-3xl font-bold text-green-600 mt-1">{visitStats.completed}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Past visits</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Cancelled</h3>
                  <p className="text-3xl font-bold text-red-600 mt-1">{visitStats.cancelled}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Cancelled visits</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{visitStats.total}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">All visits</p>
            </div>
          </div>

          {/* Bulk Cancellation Section */}
          {upcomingVisits.length > 0 && (
            <div className="mb-8 border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Manage All Bookings</h3>
                  <p className="text-sm text-gray-600">Cancel multiple upcoming visits at once</p>
                </div>
                <button
                  onClick={() => setShowBulkCancelModal(true)}
                  disabled={loadingEligibility || eligibleVisits.length === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto justify-center"
                >
                  <XCircle className="w-5 h-5" />
                  {loadingEligibility ? 'Checking...' : `Cancel All (${eligibleVisits.length})`}
                </button>
              </div>
              
              <div className="text-sm mb-3">
                {eligibleVisits.length === 0 ? (
                  <div className="flex items-center gap-2 text-amber-600 p-3 bg-amber-50 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    No visits eligible for bulk cancellation (visits must be scheduled and more than 1 hour away)
                  </div>
                ) : (
                  <div className="text-gray-700 p-3 bg-blue-50 rounded-lg">
                    You have <span className="font-semibold">{eligibleVisits.length} visit(s)</span> that can be cancelled together.
                    Store managers will be notified of each cancellation.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Schedule Visit & Visits List */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule a New Visit</h2>
                <p className="text-gray-600 mb-4">
                  Visit store pages to book appointments and unlock exclusive discounts. Browse stores below or search for specific stores.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Browse Stores
                  </button>
                  <button
                    onClick={() => router.push('/schedule')}
                    className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
                  >
                    Find Stores
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-900">My Scheduled Visits</h2>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Visits</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => router.push('/dashboard/customer/visits')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
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
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="mb-2 font-medium">No visits found</p>
                    <p className="text-sm mb-4">Start by booking your first store visit</p>
                    <button
                      onClick={() => router.push('/')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Schedule your first visit →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visits.slice(0, 5).map((visit) => {
                      const canCancel = isVisitEligibleForCancellation(visit);
                      
                      return (
                        <div
                          key={visit.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {visit.store.name}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
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
                            
                            {/* Action Menu for Individual Visits */}
                            <div className="relative">
                              <button
                                onClick={() => setActionMenuOpen(actionMenuOpen === visit.id ? null : visit.id)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                              >
                                <MoreVertical className="w-5 h-5 text-gray-500" />
                              </button>
                              
                              {actionMenuOpen === visit.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                  <button
                                    onClick={() => handleEditVisit(visit.id)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit Visit
                                  </button>
                                  
                                  {visit.status === 'scheduled' && (
                                    <button
                                      onClick={() => handleCancelVisitClick(visit)}
                                      disabled={!canCancel}
                                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${!canCancel ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Cancel Visit
                                      {!canCancel && (
                                        <span className="text-xs text-amber-600 ml-auto">
                                          Within 1 hour
                                        </span>
                                      )}
                                    </button>
                                  )}
                                  
                                  <div className="border-t border-gray-100">
                                    <Link
                                      href={`/visits/${visit.id}`}
                                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                      View Details
                                    </Link>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {visit.notes && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600 line-clamp-2">{visit.notes}</p>
                            </div>
                          )}
                          
                          {/* Quick Cancel Button (for scheduled visits) */}
                          {visit.status === 'scheduled' && canCancel && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => handleCancelVisitClick(visit)}
                                className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel this visit
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {visits.length > 5 && (
                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={() => router.push('/dashboard/customer/visits')}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
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
                    className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-200 transition font-medium"
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
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center gap-3"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">View All Visits</span>
                      <p className="text-sm text-gray-600">See your scheduled and past visits</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/customer/discounts')}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center gap-3"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">My Discounts</span>
                      <p className="text-sm text-gray-600">Available and used discounts</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/customer/profile')}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center gap-3"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Edit Profile</span>
                      <p className="text-sm text-gray-600">Update personal information</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Cancellation Modal */}
      {showCancelModal && selectedVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cancel Visit</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel your visit to <span className="font-semibold">{selectedVisit.store.name}</span> scheduled for {formatDateTime(selectedVisit.scheduledDate, selectedVisit.scheduledTime)}?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a reason...</option>
                <option value="Change of plans">Change of plans</option>
                <option value="Scheduling conflict">Scheduling conflict</option>
                <option value="Found alternative">Found alternative</option>
                <option value="Other">Other</option>
              </select>
              
              {cancelReason === 'Other' && (
                <input
                  type="text"
                  placeholder="Please specify..."
                  className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancellingVisitId === selectedVisit.id}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleIndividualCancel}
                disabled={cancellingVisitId === selectedVisit.id || !cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancellingVisitId === selectedVisit.id ? 'Cancelling...' : 'Cancel Visit'}
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              The store manager will be notified of your cancellation. Refunds may be subject to the store's cancellation policy.
            </p>
          </div>
        </div>
      )}

      {/* Bulk Cancel Modal */}
      {showBulkCancelModal && (
        <BulkCancelModal
          visits={eligibleVisits}
          onClose={() => setShowBulkCancelModal(false)}
          onSuccess={handleBulkCancellationSuccess}
        />
      )}

      {/* Close action menu when clicking outside */}
      {actionMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActionMenuOpen(null)}
        />
      )}

      {/* Help Tip */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Need help? Contact support at support@bondoutfit.com</p>
      </div>
    </div>
  );
}
