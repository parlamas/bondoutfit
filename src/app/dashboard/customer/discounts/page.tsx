//app/dashboard/customer/discounts/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Gift, CheckCircle, XCircle } from 'lucide-react';

type Discount = {
  id: string;
  code: string;
  percentage: number;
  validUntil: string;
  status: 'available' | 'used' | 'expired';
  store: {
    id: string;
    name: string;
  };
  visit?: {
    id: string;
    scheduledDate: string;
  };
};

export default function CustomerDiscountsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'used' | 'expired'>('all');

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
      loadDiscounts();
    }
  }, [status, filter]);

  async function loadDiscounts() {
    setLoading(true);
    try {
      const query = filter !== 'all' ? `?status=${filter}` : '';
      const res = await fetch(`/api/customer/discounts${query}`);
      if (res.ok) {
        const data = await res.json();
        setDiscounts(data.discounts || []);
      }
    } catch (error) {
      console.error('Failed to load discounts', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'used': return <CheckCircle className="w-5 h-5 text-gray-400" />;
      case 'expired': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
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
            <h1 className="text-2xl font-bold text-gray-900">My Discounts</h1>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
            >
              <option value="all">All Discounts</option>
              <option value="available">Available</option>
              <option value="used">Used</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {discounts.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No discounts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {discounts.map((discount) => (
                <div key={discount.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(discount.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{discount.store.name}</h3>
                        <p className="text-sm text-gray-600">Code: <span className="font-mono">{discount.code}</span></p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(discount.status)}`}>
                      {discount.status.charAt(0).toUpperCase() + discount.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{discount.percentage}% off</span>
                    <span className="text-gray-500">Valid until: {new Date(discount.validUntil).toLocaleDateString()}</span>
                  </div>

                  {discount.status === 'available' && (
                    <button
                      onClick={() => {/* Show discount code */}}
                      className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Reveal Code
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}