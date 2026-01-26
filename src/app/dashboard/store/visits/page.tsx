// app/dashboard/store/visits/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import QRScanner from '@/app/components/qr-scanner';
import { Calendar, Calendar as CalendarIcon, X, Clock, CheckCircle, XCircle, Users, Scan } from 'lucide-react';

type Visit = {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  numberOfPeople: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
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
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [manualVisitId, setManualVisitId] = useState('');
  const [rescheduleVisit, setRescheduleVisit] = useState<Visit | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

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
setVisits(data.visits || []);
      }
    } catch (error) {
      console.error('Failed to load visits', error);
    } finally {
      setLoading(false);
    }
  }

  // Handle QR scan results
  async function handleQRScan(qrData: string) {
    try {
      setScanMessage({ type: 'info', text: 'Processing QR code...' });
      
      // Parse the visit ID from the QR code
      let visitId: string;
      
      try {
        // Try to parse as URL
        const url = new URL(qrData);
        const pathParts = url.pathname.split('/');
        visitId = pathParts[2]; // Assuming /visits/{id}/scan format
      } catch {
        // If not a URL, assume it's just the visit ID
        visitId = qrData;
      }

      console.log('Processing scan for visit:', visitId);

      // Find the visit locally
      let visit = visits.find(v => v.id === visitId);

if (!visit) {
  const verifyRes = await fetch(`/api/visits/${visitId}/verify`);
  if (!verifyRes.ok) {
    setScanMessage({ type: 'error', text: 'Visit not found. Invalid QR code.' });
    return;
  }

  const verifyData = await verifyRes.json();
  visit = verifyData.visit;
}

if (!visit) {
  setScanMessage({ type: 'error', text: 'Visit not found.' });
  return;
}



      // Call the scan API endpoint
      const response = await fetch(`/api/visits/${visitId}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: (session?.user as any)?.storeId,
          scannedAt: new Date().toISOString(),
          source: 'store_scanner'
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        if (visit.status === 'SCHEDULED' && !visit.checkedInAt) {
          setScanMessage({ 
            type: 'success', 
            text: `✅ Checked in ${visit.user.name} (${visit.numberOfPeople} people) at ${formatTime(new Date().toISOString())}` 
          });
        } else if (!!visit.checkedInAt && visit.status === 'SCHEDULED') {
          setScanMessage({ 
            type: 'success', 
            text: `✅ Marked ${visit.user.name}'s visit as COMPLETED` 
          });
        } else if (visit.status === 'COMPLETED') {
          setScanMessage({ 
            type: 'info', 
            text: `ℹ️ Visit already completed on ${formatDate(visit.checkedInAt || visit.scheduledDate)}` 
          });
        }
        
        // Refresh the visits list
        await loadVisits();
        
        // Clear message after 5 seconds
        setTimeout(() => setScanMessage(null), 5000);
      } else {
        setScanMessage({ type: 'error', text: result.error || 'Failed to process scan' });
      }
    } catch (error) {
      console.error('Scan processing error:', error);
      setScanMessage({ type: 'error', text: 'Error processing QR code. Please try again.' });
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

    async function handleReschedule() {
    if (!rescheduleVisit) return;

    setRescheduling(true);
    try {
      const res = await fetch(`/api/store/visits/${rescheduleVisit.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDate,
          newTime,
          notes: rescheduleNotes,
          rescheduledBy: session?.user?.name || 'Store Manager'
        }),
      });

      if (res.ok) {
        await loadVisits();
        setRescheduleVisit(null);
        setNewDate('');
        setNewTime('');
        setRescheduleNotes('');
        setScanMessage({ type: 'success', text: 'Visit rescheduled successfully' });
        setTimeout(() => setScanMessage(null), 3000);
      } else {
        const error = await res.json();
        setScanMessage({ type: 'error', text: error.error || 'Failed to reschedule visit' });
      }
    } catch (error) {
      console.error('Failed to reschedule visit', error);
      setScanMessage({ type: 'error', text: 'Failed to reschedule visit' });
    } finally {
      setRescheduling(false);
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
      case 'SCHEDULED': return <Clock className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'MISSED': return <XCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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
      {/* Scanner Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visit Schedule</h1>
            <p className="text-gray-600 mt-2">Manage customer appointments and check-ins</p>
          </div>
          
          <div className="flex-shrink-0">
            <div className="space-y-3">
              <QRScanner 
                onScan={handleQRScan}
                onError={(error) => {
                    setScanMessage({ type: 'error', text: `Scanner error: ${error instanceof Error ? error.message : String(error)}` });
                }}
                className="w-full"
              />
              
              {scanMessage && (
                <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  scanMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                  scanMessage.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                  'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {scanMessage.type === 'success' && <CheckCircle className="w-4 h-4" />}
                    {scanMessage.type === 'error' && <XCircle className="w-4 h-4" />}
                    {scanMessage.type === 'info' && <Clock className="w-4 h-4" />}
                    {scanMessage.text}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Development Testing Section */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">DEV</span>
            <h3 className="font-semibold text-purple-800">Development Testing</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-purple-600 mb-2">Test with visit IDs:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {visits.slice(0, 3).map(visit => (
                  <button
                    key={visit.id}
                    onClick={() => handleQRScan(visit.id)}
                    className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded hover:bg-purple-200 border border-purple-300"
                  >
                    {visit.user.name} ({visit.id.substring(0, 8)}...)
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-purple-600 mb-2">Manual scan input:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualVisitId}
                  onChange={(e) => setManualVisitId(e.target.value)}
                  placeholder="Enter visit ID"
                  className="flex-1 border border-purple-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    if (manualVisitId) {
                      handleQRScan(manualVisitId);
                      setManualVisitId('');
                    }
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700"
                >
                  Test Scan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <div key={visit.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(visit.status)}`}>
                      {getStatusIcon(visit.status)}
                      {visit.status}
                    </span>
                    {!!visit.checkedInAt && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Checked In
                      </span>
                    )}
                    {visit.discountUnlocked && !visit.discountUsed && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        💰 Discount Available
                      </span>
                    )}
                    {visit.discountUsed && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        ✅ Discount Used
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

                <div className="ml-4 space-y-3 min-w-[280px]">
                  {visit.status === 'SCHEDULED' && (
                    <div className="text-center">
                      {!visit.checkedInAt ? (
                        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Scan className="w-5 h-5 text-blue-600" />
                            <p className="text-sm text-blue-800 font-medium">
                              Scan QR to Check In
                            </p>
                          </div>
                          <p className="text-xs text-blue-600">
                            Customer should show QR code from their visit page
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="text-sm text-green-800 font-medium">
                              ✅ Checked in at {formatTime(visit.checkedInAt)}
                            </p>
                          </div>
                          <p className="text-xs text-green-600">
                            Scan again when leaving to complete visit
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {visit.status === 'SCHEDULED' && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this visit?')) {
                          updateVisitStatus(visit.id, 'CANCELLED');
                        }
                      }}
                      disabled={updatingStatus === visit.id}
                      className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 w-full transition-colors"
                    >
                      {updatingStatus === visit.id ? 'Cancelling...' : 'Cancel Visit'}
                    </button>
                  )}

                                    {visit.status === 'SCHEDULED' && (
                    <button
                      onClick={() => {
                        setRescheduleVisit(visit);
                        setNewDate(visit.scheduledDate);
                        setNewTime(visit.scheduledTime);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 w-full transition-colors"
                    >
                      Reschedule
                    </button>
                  )}

                  {/* Quick test button (only in development) */}
                  {process.env.NODE_ENV === 'development' && visit.status === 'SCHEDULED' && (
                    <button
                      onClick={() => handleQRScan(visit.id)}
                      className="px-4 py-2 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-200 w-full transition-colors border border-purple-200"
                    >
                      🧪 Test Scan (Dev)
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
      
      {/* Reschedule Modal */}
      {rescheduleVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Reschedule Visit</h3>
              <button
                onClick={() => {
                  setRescheduleVisit(null);
                  setNewDate('');
                  setNewTime('');
                  setRescheduleNotes('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-700 mb-2">
                  Rescheduling visit for <span className="font-semibold">{rescheduleVisit.user.name}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Current schedule: {formatDate(rescheduleVisit.scheduledDate)} at {rescheduleVisit.scheduledTime}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  placeholder="Reason for rescheduling..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setRescheduleVisit(null);
                    setNewDate('');
                    setNewTime('');
                    setRescheduleNotes('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={rescheduling}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  disabled={rescheduling || !newDate || !newTime}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rescheduling ? 'Rescheduling...' : 'Reschedule Visit'}
                </button>
                            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}