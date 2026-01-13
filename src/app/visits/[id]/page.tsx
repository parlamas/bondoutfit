// src/app/visits/[id]/page.tsx - COMPLETE VERSION WITH EDIT & CANCEL

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import QRCode from 'react-qr-code';
import { Calendar, Clock, Users, MapPin, AlertCircle, CheckCircle, XCircle, Edit, Printer, Home } from 'lucide-react';

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
  checkedIn: boolean;
  checkedInAt?: string;
  customerNotes?: string;
  store: {
    name: string;
    street: string;
    streetNumber: string;
    city: string;
    country: string;
    openingHours?: string;
  };
};

export default function VisitDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const visitId = params.id as string;
  
  const [visit, setVisit] = useState<VisitDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Cancellation states
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelEligibility, setCancelEligibility] = useState<any>(null);
  
  // Editing states
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    numberOfPeople: 1,
    customerNotes: '',
  });
  const [editEligibility, setEditEligibility] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/customer/signin');
      return;
    }

    if (status === 'authenticated') {
      loadVisit();
      checkCancelEligibility();
      checkEditEligibility();
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

  async function checkCancelEligibility() {
    try {
      const res = await fetch(`/api/visits/${visitId}/cancel`);
      if (res.ok) {
        const data = await res.json();
        setCancelEligibility(data);
      }
    } catch (error) {
      console.error('Failed to check cancellation eligibility:', error);
    }
  }

  async function checkEditEligibility() {
    try {
      const res = await fetch(`/api/visits/${visitId}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setEditEligibility(data);
      }
    } catch (error) {
      console.error('Failed to check edit eligibility:', error);
    }
  }

  async function handleCancelVisit() {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    setCancelling(true);
    try {
      const res = await fetch(`/api/visits/${visitId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Visit cancelled successfully!');
        setVisit(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
        setShowCancelModal(false);
        setCancelReason('');
      } else {
        alert(`Failed to cancel visit: ${data.error}`);
      }
    } catch (error) {
      console.error('Error cancelling visit:', error);
      alert('An error occurred while cancelling the visit');
    } finally {
      setCancelling(false);
    }
  }

  async function handleEditVisit() {
    try {
      const res = await fetch(`/api/visits/${visitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Visit updated successfully!');
        setVisit(data.visit);
        setEditing(false);
        loadVisit(); // Reload visit data
      } else {
        alert(`Failed to update visit: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating visit:', error);
      alert('An error occurred while updating the visit');
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

  function getStatusIcon(status: string) {
    switch (status) {
      case 'SCHEDULED': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'MISSED': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'MISSED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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
    storeId: visit.store.name,
    date: visit.scheduledDate,
    time: visit.scheduledTime,
  });

  const canCancel = cancelEligibility?.canCancel && visit.status === 'SCHEDULED';
  const canEdit = editEligibility?.canEdit && visit.status === 'SCHEDULED';

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Visit</h3>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel your visit scheduled for {formatDate(visit.scheduledDate)} at {visit.scheduledTime}?
            </p>

            {cancelEligibility?.requirements?.hoursUntilVisit && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⏰ You have {parseFloat(cancelEligibility.requirements.hoursUntilVisit).toFixed(1)} hours until your visit.
                  Cancellations within 1 hour may not be refundable.
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
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
                disabled={cancelling}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelVisit}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Visit'}
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              The store will be notified of your cancellation. Refunds may be subject to the store's cancellation policy.
            </p>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Visit</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={editForm.scheduledDate}
                  onChange={(e) => setEditForm({...editForm, scheduledDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={editForm.scheduledTime}
                  onChange={(e) => setEditForm({...editForm, scheduledTime: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Store hours: {visit.store.openingHours || '9:00 - 18:00'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of People
                </label>
                <select
                  value={editForm.numberOfPeople}
                  onChange={(e) => setEditForm({...editForm, numberOfPeople: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Notes (Optional)
                </label>
                <textarea
                  value={editForm.customerNotes}
                  onChange={(e) => setEditForm({...editForm, customerNotes: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any special requirements or notes for the store..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditVisit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              The store will be notified of your schedule changes. Please note that changes may be subject to availability.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visit Details</h1>
            <p className="text-gray-600 mt-2">Manage your scheduled visit</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(visit.status)}`}>
              {getStatusIcon(visit.status)}
              {visit.status}
            </span>
            {visit.checkedIn && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Checked In
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Visit Details */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Visit Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Date</div>
                  <div className="font-medium">{formatDate(visit.scheduledDate)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Time</div>
                  <div className="font-medium">{visit.scheduledTime}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Number of Visitors</div>
                  <div className="font-medium">{visit.numberOfPeople} {visit.numberOfPeople === 1 ? 'person' : 'people'}</div>
                </div>
              </div>

              {visit.checkedInAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-sm text-gray-600">Checked in at</div>
                    <div className="font-medium">
                      {new Date(visit.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )}

              {visit.customerNotes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-700 mb-2">Your Notes:</div>
                  <div className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                    {visit.customerNotes}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons (only for SCHEDULED visits) */}
            {visit.status === 'SCHEDULED' && (
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                {/* Edit Button */}
                <div>
                  {canEdit ? (
                    <button
                      onClick={() => {
                        setEditForm({
                          scheduledDate: visit.scheduledDate,
                          scheduledTime: visit.scheduledTime,
                          numberOfPeople: visit.numberOfPeople,
                          customerNotes: visit.customerNotes || '',
                        });
                        setEditing(true);
                      }}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                      <Edit className="w-5 h-5" />
                      Edit Visit
                    </button>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 text-center">
                        {visit.checkedIn 
                          ? 'Cannot edit a visit that has been checked in'
                          : editEligibility?.requirements?.hoursUntilVisit < 2
                            ? 'Cannot edit within 2 hours of scheduled visit time'
                            : 'This visit cannot be edited'
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Cancel Button */}
                <div>
                  {canCancel ? (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Cancel Visit
                    </button>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 text-center">
                        {visit.checkedIn 
                          ? 'Cannot cancel a visit that has been checked in'
                          : cancelEligibility?.requirements?.hoursUntilVisit < 1
                            ? 'Cannot cancel within 1 hour of scheduled visit time'
                            : 'This visit cannot be cancelled'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Store Information</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium">{visit.store.name}</div>
                  <div className="text-gray-600 mt-1">
                    {visit.store.street} {visit.store.streetNumber}<br />
                    {visit.store.city}, {visit.store.country}
                  </div>
                </div>
              </div>
              
              {visit.store.openingHours && (
                <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium">Opening Hours</div>
                    <div className="text-gray-600 mt-1">{visit.store.openingHours}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {visit.discountUnlocked && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">🎉 Discount Unlocked!</h2>
              <p className="text-green-700 mb-3">
                You have unlocked a special discount for your scheduled visit.
              </p>
              {visit.discountCode && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-green-800 mb-1">Your Discount Code:</div>
                  <div className="font-mono bg-white border border-green-300 px-4 py-3 rounded-lg text-green-900 text-lg text-center">
                    {visit.discountCode}
                  </div>
                  <p className="text-sm text-green-600 mt-2 text-center">
                    Show this code at checkout to redeem your discount
                  </p>
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
            <div className="bg-white p-4 border-2 border-gray-200 rounded-xl mb-4 shadow-sm">
              <QRCode
                value={qrData}
                size={256}
                level="H"
              />
            </div>
            
            <div className="text-center space-y-1 mb-6">
              <p className="text-sm font-medium text-gray-700">Visit ID: {visit.id}</p>
              <p className="text-sm text-gray-600">Store: {visit.store.name}</p>
              <p className="text-sm text-gray-600">Date: {formatDate(visit.scheduledDate)}</p>
            </div>

            <div className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">📱 How to use:</h3>
              <ul className="text-sm text-blue-700 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">1.</span>
                  <span>Show this QR code to store staff upon arrival</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">2.</span>
                  <span>The QR code will be scanned to check you in</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">3.</span>
                  <span>After check-in, you'll unlock any scheduled discounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">4.</span>
                  <span>Keep this page accessible or take a screenshot</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => router.push('/dashboard/customer')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Details
        </button>
      </div>

      {/* Help Information */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">ℹ️ Need help?</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• For urgent changes, contact the store directly</li>
          <li>• Cancellations made more than 1 hour in advance may be refundable</li>
          <li>• Edits must be made at least 2 hours before your scheduled time</li>
          <li>• Once checked in, changes cannot be made to your visit</li>
        </ul>
      </div>
    </div>
  );
}