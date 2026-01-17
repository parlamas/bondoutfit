// src/components/BulkCancelModal.tsx

'use client';

import { useState } from 'react';
import { XCircle, AlertCircle, Calendar, Users, MapPin, X, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';

interface Store {
  name: string;
  city: string;
  country: string;
}

interface Visit {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  store: Store;
  numberOfPeople: number;
}

interface BulkCancelModalProps {
  visits: Visit[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkCancelModal({ visits, onClose, onSuccess }: BulkCancelModalProps) {
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
          alert(`ℹ️ ${data.skippedCount} visit(s) could not be cancelled (within 1 hour or already checked in)`);
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
          {/* Warning Alert */}
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

          {/* Visits List */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Visits to be cancelled ({visits.length}):
            </h4>
            <div className="border border-gray-200 rounded-lg divide-y max-h-60 overflow-y-auto">
              {visits.map((visit) => (
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

          {/* Cancellation Reason */}
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

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">What happens next?</p>
                <ul className="mt-1 space-y-1">
                  <li>• Store managers will receive email notifications</li>
                  <li>• You'll receive a confirmation email summary</li>
                  <li>• Refunds will be processed per store policies</li>
                  <li>• All discounts associated with these visits will be deactivated</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
}