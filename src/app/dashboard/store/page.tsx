//src/app/dashboard/store/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, User, Calendar, Clock, Users, Store, Camera } from 'lucide-react';
import QRScanner from '../../../app/components/qr-scanner';

type VisitDetails = {
  id: string;
  customerName: string;
  customerEmail: string;
  storeName: string;
  scheduledDate: string;
  scheduledTime: string;
  numberOfPeople: number;
  checkedInAt?: string;
  discountUnlocked: boolean;
  discountCode?: string;
};

export default function StoreDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [visitDetails, setVisitDetails] = useState<VisitDetails | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  if (status === 'unauthenticated') {
    router.push('/auth/store/signin');
    return;
  }
  
  // Check if user has STORE_MANAGER role
  if (status === 'authenticated' && session?.user?.role !== 'STORE_MANAGER') {
    // Customer trying to access store dashboard - redirect them
    if (session?.user?.role === 'CUSTOMER') {
      router.push('/dashboard/customer');
      return;
    } else {
      router.push('/auth/store/signin');
      return;
    }
  }
  
  // Only load data if user is a store manager
  if (status === 'authenticated' && session?.user?.role === 'STORE_MANAGER') {
    loadRecentCheckIns();
  }
}, [status, session, router]);

  async function loadRecentCheckIns() {
    try {
      const res = await fetch('/api/store/check-ins');
      if (res.ok) {
        const data = await res.json();
        setRecentCheckIns(data.checkIns || []);
      }
    } catch (error) {
      console.error('Failed to load check-ins:', error);
    }
  }

  function handleScan(result: any) {
    if (result && !scanning) {
      setScanning(true);
      setScanResult(result);
      
      try {
        const data = JSON.parse(result);
        if (data.visitId) {
          verifyVisit(data.visitId);
        } else {
          setError('Invalid QR code - no visit ID found');
          setScanning(false);
        }
      } catch (error) {
        setError('Failed to parse QR code data');
        setScanning(false);
      }
    }
  }

  async function verifyVisit(visitId: string) {
    try {
      const res = await fetch(`/api/visits/${visitId}/verify`);
      if (res.ok) {
        const data = await res.json();
        setVisitDetails(data.visit);
        setError(null);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to verify visit');
        setVisitDetails(null);
      }
    } catch (error) {
      setError('Network error - please try again');
      setVisitDetails(null);
    } finally {
      setScanning(false);
    }
  }

  async function handleCheckIn() {
    if (!visitDetails) return;

    setCheckingIn(true);
    setError(null);

    try {
      const res = await fetch(`/api/visits/${visitDetails.id}/check-in`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        // Update local state
        setVisitDetails(prev => prev ? {
          ...prev,
          checkedInAt: new Date().toISOString(),
          discountUnlocked: data.visit.discountUnlocked || false,
          discountCode: data.visit.discountCode,
        } : null);
        
        // Reload recent check-ins
        loadRecentCheckIns();
        
        // Reset after 5 seconds
        setTimeout(() => {
          setVisitDetails(null);
          setScanResult(null);
        }, 5000);
      } else {
        setError(data.error || 'Failed to check in');
      }
    } catch (error) {
      setError('Network error - please try again');
    } finally {
      setCheckingIn(false);
    }
  }

  function resetScanner() {
    setScanning(false);
    setScanResult(null);
    setVisitDetails(null);
    setError(null);
  }

  function simulateScan() {
    const testData = JSON.stringify({
      visitId: "cmkcshyfv0001u4ggdpjxtidm",
      storeId: "Belles Femmes",
      date: "2026-01-14",
      time: "17:00"
    });
    handleScan(testData);
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is not a store manager (after loading)
if (status === 'authenticated' && session?.user?.role !== 'STORE_MANAGER') {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

if (!session) {
  return null;
}

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Store Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome, {session.user?.name}</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/store/visits')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View All Visits
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - QR Scanner */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">QR Code Scanner</h2>
                
                {!scanResult ? (
  <div className="space-y-4">
    <QRScanner 
      onScan={handleScan}
      onError={(error) => {
        console.error('Scanner error:', error);
        setError('Scanner error: ' + String(error));
      }}
      className="w-full"
    />
    
    <div className="flex items-center justify-center gap-4">
      <div className="flex-1 h-px bg-gray-300"></div>
      <span className="text-sm text-gray-500">or</span>
      <div className="flex-1 h-px bg-gray-300"></div>
    </div>
    
    <div className="text-center">
      <button
        onClick={simulateScan}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
      >
        Test with Simulated QR Code
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Use this to test without a physical QR code
      </p>
    </div>
  </div>

) : (
  <div className="text-center">
    <div className="mb-4">
      <div className="inline-block p-3 bg-green-100 rounded-full">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <p className="mt-2 text-green-600 font-medium">QR Code Scanned!</p>
    </div>
    
    <button
      onClick={resetScanner}
      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
    >
      Scan Another Code
    </button>
  </div>
)}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Error:</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Visit Details */}
              {visitDetails && (
                <div className="bg-white rounded-xl shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Visit Details</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Customer</div>
                        <div className="font-medium">{visitDetails.customerName}</div>
                        <div className="text-sm text-gray-500">{visitDetails.customerEmail}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Store</div>
                        <div className="font-medium">{visitDetails.storeName}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Date</div>
                          <div className="font-medium">
                            {new Date(visitDetails.scheduledDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Time</div>
                          <div className="font-medium">{visitDetails.scheduledTime}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Number of People</div>
                        <div className="font-medium">{visitDetails.numberOfPeople}</div>
                      </div>
                    </div>
                  </div>

                  {/* Check-in Button */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    {visitDetails.checkedInAt ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Checked In!</span>
                          <span>
                            at {new Date(visitDetails.checkedInAt).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        {visitDetails.discountUnlocked && visitDetails.discountCode && (
                          <div className="mt-3 p-3 bg-white border border-green-300 rounded-lg">
                            <div className="font-medium text-green-800 mb-1">Discount Code:</div>
                            <div className="font-mono text-lg text-center p-2 bg-gray-50 rounded">
                              {visitDetails.discountCode}
                            </div>
                            <p className="text-sm text-green-600 mt-2 text-center">
                              Customer has unlocked a discount
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={handleCheckIn}
                        disabled={checkingIn}
                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {checkingIn ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Checking In...
                          </span>
                        ) : (
                          'Check In Customer'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Recent Check-ins */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Check-ins</h2>
                
                {recentCheckIns.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent check-ins</p>
                    <p className="text-sm mt-1">Scan a QR code to check in customers</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCheckIns.slice(0, 5).map((checkIn) => (
                      <div key={checkIn.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{checkIn.customerName}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              {new Date(checkIn.checkedInAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Checked In
                          </span>
                        </div>
                        {checkIn.discountUnlocked && (
                          <div className="mt-2 text-xs text-blue-600">
                            ✓ Discount unlocked
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Today's Check-ins</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {recentCheckIns.filter(ci => 
                        new Date(ci.checkedInAt).toDateString() === new Date().toDateString()
                      ).length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Scheduled</div>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}