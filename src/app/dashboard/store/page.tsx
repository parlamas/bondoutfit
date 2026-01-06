//src/app/dashboard/store/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

import { 
  Building2, Calendar, Tag, Package, Image, BarChart, 
  Users, Clock, Settings, Bell, TrendingUp, Edit,
  X, Plus
} from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  email?: string;
  phoneCountry?: string;
  phoneArea?: string;
  phoneNumber: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  street: string;
  streetNumber: string;
  floor?: string;
  categories: string[];
  acceptedCurrencies: string[]; // Array of currency codes
}

export default function StoreDashboard() {
  const router = useRouter();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCurrencies, setEditingCurrencies] = useState(false);
  const [tempCurrencies, setTempCurrencies] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [newCurrency, setNewCurrency] = useState('');
  const [currencyError, setCurrencyError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(() => {
    fetchStoreData();
  }, []);

  useEffect(() => {
  return () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
  };
}, []);



  const fetchStoreData = async () => {
    try {
      const response = await fetch('/api/store/profile');
      if (response.ok) {
        const data = await response.json();
        setStoreData(data);
        setTempCurrencies(data.acceptedCurrencies || []);
      }
    } catch (error) {
      console.error('Failed to fetch store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrencies = async () => {
    if (!storeData) return;
    setSuccessMessage('');
    setSaving(true);
    try {
      const response = await fetch('/api/store/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptedCurrencies: tempCurrencies }),
      });

      if (response.ok) {
  const updatedData = await response.json();
  setStoreData(updatedData);
  setEditingCurrencies(false);
  setCurrencyError('');

  if (successTimeoutRef.current) {
    clearTimeout(successTimeoutRef.current);
  }

  setSuccessMessage('Currencies saved');
  successTimeoutRef.current = setTimeout(() => {
    setSuccessMessage('');
  }, 3000);
}


    } catch (error) {
      console.error('Failed to save currencies:', error);
    } finally {
      setSaving(false);
    }
  };

  const addCurrency = () => {
    const currency = newCurrency.trim().toUpperCase();
    
    if (!currency) {
      setCurrencyError('Please enter a currency code');
      return;
    }
    
    if (currency.length !== 3) {
      setCurrencyError('Currency code must be exactly 3 letters');
      return;
    }
    
    if (!/^[A-Z]{3}$/.test(currency)) {
      setCurrencyError('Currency code must contain only letters (A-Z)');
      return;
    }
    
    if (tempCurrencies.includes(currency)) {
      setCurrencyError('This currency is already added');
      return;
    }
    
    setTempCurrencies([...tempCurrencies, currency]);
    setNewCurrency('');
    setCurrencyError('');
  };

  const removeCurrency = (currency: string) => {
    setTempCurrencies(tempCurrencies.filter(c => c !== currency));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCurrency();
    }
  };

  if (loading) { return ( <div className="min-h-screen bg-gray-50 flex items-center justify-center"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div> </div> ); }

  if (!storeData) {
  return null;
}


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{storeData.name} Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your store, visits, and discounts</p>
            </div>
            <div className="text-sm text-gray-600 text-right">
  <div>Welcome</div>
  {storeData.email && (
    <div className="text-xs text-gray-500">
      {storeData.email}
    </div>
  )}
</div>

          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Store Info & Stats */}
          <div className="lg:col-span-2 space-y-8">
            {/* Store Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  Store Information
                </h2>
                <button
                  onClick={() => router.push('/dashboard/store/profile')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit Profile
                </button>
              </div>

              {/* Accepted Currencies Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">
  Accepted Currencies
</h3>
                  <button
                    onClick={() => {
                      setEditingCurrencies(!editingCurrencies);
                      setNewCurrency('');
                      setCurrencyError('');
                      if (!editingCurrencies) {
                        setTempCurrencies(storeData.acceptedCurrencies || []);
                      }
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    {editingCurrencies ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {successMessage && (
  <p className="text-green-600 text-sm mt-2">
    {successMessage}
  </p>
)}


                {editingCurrencies ? (
                  <div className="space-y-4">
                    {/* Currency Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Currency (3-letter ISO code)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCurrency}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                            setNewCurrency(value);
                            if (currencyError) setCurrencyError('');
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder="e.g., USD, EUR, GBP"
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                          maxLength={3}
                        />
                        <button
                          onClick={addCurrency}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </button>
                      </div>
                      {currencyError && (
                        <p className="text-red-600 text-sm mt-1">{currencyError}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        Enter a 3-letter ISO currency code (e.g., USD for US Dollar)
                      </p>
                    </div>

                    {/* Selected Currencies */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Currencies ({tempCurrencies.length})
                      </label>
                      {tempCurrencies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {tempCurrencies.map((currency) => (
                            <div
  key={currency}
  className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg flex items-center gap-2"
>
  <span className="font-medium">{currency}</span>
  <button
    onClick={() => removeCurrency(currency)}
    className="text-blue-600 hover:text-blue-800 ml-2"
  >
    <X className="h-4 w-4" />
  </button>
</div>

                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic py-2">No currencies selected</p>
                      )}
                    </div>

                    {/* Save/Cancel Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={saveCurrencies}
                        disabled={saving}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Currencies'}
                      </button>
                      <button
                        onClick={() => {
                          setTempCurrencies(storeData.acceptedCurrencies || []);
                          setEditingCurrencies(false);
                          setCurrencyError('');
                        }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {storeData.acceptedCurrencies?.length > 0 ? (
                      storeData.acceptedCurrencies.map((currency) => (
                        <span
  key={currency}
  className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium"
>
  {currency}
</span>

                      ))
                    ) : (
                      <p className="text-gray-500 italic py-2">No currencies set yet</p>
                    )}
                  </div>
                )}
              </div>

              {/* Store Categories */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Store Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {storeData.categories?.map((category) => (
                    <span
                      key={category}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Address</p>
                  <p className="text-gray-900 font-medium">
                    {storeData.street} {storeData.streetNumber}
                    {storeData.floor && `, Floor ${storeData.floor}`}<br />
                    {storeData.city}, {storeData.state} {storeData.zip}<br />
                    {storeData.country}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Contact</p>
                  <p className="text-gray-900 font-medium">
                    {storeData.phoneCountry} {storeData.phoneArea} {storeData.phoneNumber}<br />
                    {storeData.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">12</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mt-2">Scheduled Visits</h3>
                <p className="text-xs text-gray-500">Next 7 days</p>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <Tag className="h-8 w-8 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">5</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mt-2">Active Discounts</h3>
                <p className="text-xs text-gray-500">Currently running</p>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-purple-600" />
                  <span className="text-2xl font-bold text-gray-900">48</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mt-2">Total Customers</h3>
                <p className="text-xs text-gray-500">All time</p>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <span className="text-2xl font-bold text-gray-900">68%</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mt-2">Conversion Rate</h3>
                <p className="text-xs text-gray-500">Visit to purchase</p>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-8">
            {/* Management Cards */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Management</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/dashboard/store/visits')}
                  className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-3"
                >
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="font-medium text-blue-800">Visit Schedule</span>
                    <p className="text-sm text-blue-600">Manage appointments</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/dashboard/store/discounts')}
                  className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition flex items-center gap-3"
                >
                  <Tag className="h-5 w-5 text-green-600" />
                  <div>
                    <span className="font-medium text-green-800">Discounts</span>
                    <p className="text-sm text-green-600">Create promotions</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/dashboard/store/items')}
                  className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition flex items-center gap-3"
                >
                  <Package className="h-5 w-5 text-purple-600" />
                  <div>
                    <span className="font-medium text-purple-800">Store Items</span>
                    <p className="text-sm text-purple-600">Manage products</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/dashboard/store/images')}
                  className="w-full text-left px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition flex items-center gap-3"
                >
                  <Image className="h-5 w-5 text-amber-600" />
                  <div>
                    <span className="font-medium text-amber-800">Store Images</span>
                    <p className="text-sm text-amber-600">Upload photos</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bell className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">New visit scheduled</p>
                    <p className="text-gray-500">Tomorrow at 2:30 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Discount redeemed</p>
                    <p className="text-gray-500">15% off clothing purchase</p>
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