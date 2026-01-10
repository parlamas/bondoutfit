'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import QRCode from 'react-qr-code';
import { Calendar, Clock, Users, MapPin, CheckCircle, XCircle } from 'lucide-react';

type VisitDetails = {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  numberOfPeople: number;
  checkedIn: boolean;
  checkedInAt: string | null;
  customerNotes: string | null;
  discountUnlocked: boolean;
  discountUsed: boolean;
  discountCode: string | null;
  discountAmount: number | null;
  discountPercent: number | null;
  store: {
    name: string;
    street: string;
    streetNumber: string;
    city: string;
    country: string;
  };
};

export default function VisitDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const visitId = params.id as string;
  
  const [visit, setVisit] = useState<VisitDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/customer/signin');
      return;
    }

    if (status === 'authenticated') {
      loadVisit();
    }
  }, [status, router, visitId]);

  async function loadVisit() {
    try {
      const res = await fetch(`/api/visits/${visitId}`);
      if (res.ok) {
        const data = await res.json();
        setVisit(data);
      } else {
        console.error('Failed to load visit');
        router.push('/dashboard/customer');
      }
    } catch (error) {
      console.error('Failed to load visit', error);
      router.push('/dashboard/customer');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelVisit() {
    if (!confirm('Are you sure you want to cancel this visit? This action cannot be undone.')) return;
    
    setCancelling(true);
    try {
      const res = await fetch(`/api/visits/${visitId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer cancelled' }),
      });

      if (res.ok) {
        alert('Visit cancelled successfully');
        router.push('/dashboard/customer');
      } else {
        const error = await res.json();
        alert(`Failed to cancel: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to cancel visit:', error);
      alert('Failed to cancel visit');
    } finally {
      setCancelling(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatTime(dateString: string | null) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'SCHEDULED': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'MISSED': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-gray-500" />;
      default: return <Clock className="w-5 h-5" />;
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'SCHEDULED': return 'Scheduled';
      case 'COMPLETED': return 'Completed';
      case 'MISSED': return 'Missed';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading visit details...</p>
      </div>
    </div>
  );

  if (!visit) return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Visit not found</h2>
        <button
          onClick={() => router.push('/dashboard/customer')}
          className="text-blue-600 hover:text-blue-800"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  const qrData = JSON.stringify({
    visitId: visit.id,
    storeName: visit.store.name,
    date: visit.scheduledDate,
    time: visit.scheduledTime,
    customerName: session?.user?.name || 'Customer',
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/customer')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Visit Details</h1>
        <p className="text-gray-600 mt-2">Your scheduled visit information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Visit Information */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className={`p-6 rounded-xl ${
            visit.status === 'SCHEDULED' ? 'bg-blue-50 border border-blue-200' :
            visit.status === 'COMPLETED' ? 'bg-green-50 border border-green-200' :
            visit.status === 'CANCELLED' ? 'bg-gray-50 border border-gray-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(visit.status)}
                <div>
                  <h3 className="font-semibold text-gray-900">Status: {getStatusText(visit.status)}</h3>
                  {visit.checkedIn && (
                    <p className="text-sm text-green-600 mt-1">✅ Checked in at {formatTime(visit.checkedInAt)}</p>
                  )}
                </div>
              </div>
              {visit.status === 'SCHEDULED' && (
                <button
                  onClick={handleCancelVisit}
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Visit'}
                </button>
              )}
            </div>
          </div>

          {/* Visit Details Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Visit Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Date & Time</p>
                  <p className="text-gray-900">
                    {formatDate(visit.scheduledDate)} at {visit.scheduledTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Group Size</p>
                  <p className="text-gray-900">
                    {visit.numberOfPeople} {visit.numberOfPeople === 1 ? 'person' : 'people'}
                  </p>
                </div>
              </div>

              {visit.customerNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Your Notes</p>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {visit.customerNotes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Store Information Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Store Information</h2>
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">{visit.store.name}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {visit.store.street} {visit.store.streetNumber}<br />
                  {visit.store.city}, {visit.store.country}
                </p>
              </div>
            </div>
          </div>

          {/* Discount Information */}
          {visit.discountUnlocked && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">🎉 Discount Unlocked!</h2>
              <p className="text-green-700 mb-3">
                You have unlocked a special discount for your scheduled visit.
              </p>
              
              {visit.discountCode && (
                <div className="mb-3">
                  <p className="font-medium text-green-800 mb-2">Your Discount Code:</p>
                  <div className="font-mono bg-white border border-green-300 px-4 py-3 rounded-lg text-green-900 text-lg text-center">
                    {visit.discountCode}
                  </div>
                </div>
              )}

              {(visit.discountPercent || visit.discountAmount) && (
                <div className="text-green-800">
                  <p className="font-medium">Discount Value:</p>
                  <p className="text-2xl font-bold mt-1">
                    {visit.discountPercent 
                      ? `${visit.discountPercent}% OFF` 
                      : `€${visit.discountAmount} OFF`
                    }
                  </p>
                </div>
              )}

              {visit.discountUsed && (
                <div className="mt-3 pt-3 border-t border-green-300">
                  <p className="text-green-700 font-medium">✅ Discount has been used</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - QR Code */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Check-in QR Code</h2>
            <p className="text-gray-600 mb-6">
              Present this QR code at the store when you arrive. The staff will scan it to check you in.
            </p>
            
            <div className="flex flex-col items-center">
              <div className="bg-white p-6 border-2 border-gray-300 rounded-2xl mb-6">
                <QRCode
                  value={qrData}
                  size={280}
                  level="H"
                  fgColor="#1f2937"
                />
              </div>
              
              <div className="text-center text-sm text-gray-500 space-y-1">
                <p>📍 Store: {visit.store.name}</p>
                <p>📅 Date: {formatDate(visit.scheduledDate)}</p>
                <p>⏰ Time: {visit.scheduledTime}</p>
                <p className="text-xs mt-2">Visit ID: {visit.id}</p>
              </div>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg w-full">
                <h3 className="font-medium text-blue-800 mb-2">📋 Instructions:</h3>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">1.</span>
                    <span>Show this QR code to store staff upon arrival</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">2.</span>
                    <span>First scan will check you in and unlock discounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">3.</span>
                    <span>Second scan when leaving marks visit as completed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">4.</span>
                    <span>Keep this page accessible or take a screenshot</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <span>🖨️</span> Print Details
            </button>
            <button
              onClick={() => {
                const canvas = document.querySelector('canvas');
                if (canvas) {
                  const link = document.createElement('a');
                  link.download = `qr-code-${visit.id}.png`;
                  link.href = canvas.toDataURL();
                  link.click();
                }
              }}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              <span>📥</span> Save QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}