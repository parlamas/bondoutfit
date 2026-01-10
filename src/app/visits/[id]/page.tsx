//src/app/visits/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import QRCode from 'react-qr-code';

type VisitDetails = {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  numberOfPeople: number;
  discountUnlocked: boolean;
  discountUsed: boolean;
  discountCode?: string;
  discountAmount?: number;
  discountPercent?: number;
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

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
    storeId: visit.store.name,
    date: visit.scheduledDate,
    time: visit.scheduledTime,
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Visit Confirmation</h1>
        <p className="text-gray-600 mt-2">Your visit has been scheduled successfully</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Visit Details */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Visit Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${visit.status === 'SCHEDULED' ? 'text-green-600' : 'text-gray-700'}`}>
                  {visit.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(visit.scheduledDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{visit.scheduledTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Visitors:</span>
                <span className="font-medium">{visit.numberOfPeople}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Store Information</h2>
            <div className="space-y-2">
              <div className="font-medium">{visit.store.name}</div>
              <div className="text-gray-600">
                {visit.store.street} {visit.store.streetNumber}<br />
                {visit.store.city}, {visit.store.country}
              </div>
            </div>
          </div>

          {visit.discountUnlocked && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">🎉 Discount Unlocked!</h2>
              <p className="text-green-700 mb-2">
                You have unlocked a special discount for your scheduled visit.
              </p>
              {visit.discountCode && (
                <div className="mt-3">
                  <span className="font-medium text-green-800">Discount Code:</span>
                  <div className="font-mono bg-white border border-green-300 px-3 py-2 rounded-lg mt-1 text-green-900">
                    {visit.discountCode}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - QR Code */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Check-in QR Code</h2>
          <p className="text-gray-600 mb-6">
            Present this QR code at the store when you arrive. The staff will scan it to check you in.
          </p>
          
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 border border-gray-300 rounded-lg mb-4">
              <QRCode
                value={qrData}
                size={256}
                level="H"
              />
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>Visit ID: {visit.id}</p>
              <p>Valid for: {visit.store.name}</p>
              <p>Date: {formatDate(visit.scheduledDate)}</p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Instructions:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Show this QR code to store staff upon arrival</li>
                <li>• The QR code will be scanned to check you in</li>
                <li>• After check-in, you'll unlock any scheduled visit discounts</li>
                <li>• Keep this page accessible or take a screenshot</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={() => router.push('/dashboard/customer')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Print Details
        </button>
      </div>
    </div>
  );
}