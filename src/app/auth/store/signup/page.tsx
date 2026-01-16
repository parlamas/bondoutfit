// src/app/auth/store/signup/page.tsx - COMPLETE WITH STORE TYPE FIELD

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function StoreSignUpPage() {
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phoneCountry: '',
    phoneArea: '',
    phoneNumber: '',
    city: '',
    state: '',
    zip: '',
    role: 'STORE_MANAGER',
    storeName: '',
    country: '',
    street: '',
    streetNumber: '',
    floor: '',
    categories: [] as string[],
  });

  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'categories') {
      // Store categories as array with single string
      setFormData(prev => ({ ...prev, categories: [value] }));
    } else {
      // For all other fields
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Store Signup Successful!</h2>
          <p className="text-gray-700 mb-6">Please check your email to verify your account.</p>
          <Link
            href="/auth/store/signin"
            className="inline-block bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900"
          >
            Go to Store Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Store Manager Sign Up
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have a store account?{' '}
            <Link
              href="/auth/store/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Store Sign In
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              {/* Phone Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="phoneCountry" className="block text-xs font-medium text-gray-700">
                    Country Code *
                  </label>
                  <input
                    id="phoneCountry"
                    name="phoneCountry"
                    type="text"
                    required
                    value={formData.phoneCountry}
                    onChange={handleChange}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1"
                  />
                </div>

                <div>
                  <label htmlFor="phoneArea" className="block text-xs font-medium text-gray-700">
                    Area Code *
                  </label>
                  <input
                    id="phoneArea"
                    name="phoneArea"
                    type="text"
                    required
                    value={formData.phoneArea}
                    onChange={handleChange}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="212"
                    maxLength={3}
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="5551234"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-xs font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-xs font-medium text-gray-700">
                    State *
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label htmlFor="zip" className="block text-xs font-medium text-gray-700">
                    ZIP *
                  </label>
                  <input
                    id="zip"
                    name="zip"
                    type="text"
                    required
                    value={formData.zip}
                    onChange={handleChange}
                    className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>

            {/* Right column - Store Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Store Information</h3>
              
              <div>
                <label htmlFor="storeName" className="block text-xs font-medium text-gray-700">
                  Store Name *
                </label>
                <input
                  id="storeName"
                  name="storeName"
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={handleChange}
                  className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="My Store"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-xs font-medium text-gray-700">
                  Country *
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Country"
                />
              </div>

              <div>
                <label htmlFor="street" className="block text-xs font-medium text-gray-700">
                  Street *
                </label>
                <input
                  id="street"
                  name="street"
                  type="text"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Street Address"
                />
              </div>

              <div>
                <label htmlFor="streetNumber" className="block text-xs font-medium text-gray-700">
                  Street Number *
                </label>
                <input
                  id="streetNumber"
                  name="streetNumber"
                  type="text"
                  required
                  value={formData.streetNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123"
                />
              </div>

              <div>
                <label htmlFor="floor" className="block text-xs font-medium text-gray-700">
                  Floor / Unit
                </label>
                <input
                  id="floor"
                  name="floor"
                  type="text"
                  value={formData.floor}
                  onChange={handleChange}
                  className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 2nd floor, Unit 5"
                />
              </div>

              {/* STORE TYPE FIELD - ADDED BACK */}
              <div>
                <label htmlFor="categories" className="block text-xs font-medium text-gray-700">
                  Store Type
                </label>
                <input
                  id="categories"
                  name="categories"
                  type="text"
                  value={formData.categories[0] || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Women's Fashion Boutique"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50"
            >
              {loading ? 'Creating store account...' : 'Sign up as Store Manager'}
            </button>
          </div>

          <div className="text-sm text-center pt-4">
            <p className="text-gray-600">
              Want to sign up as a customer instead?{' '}
              <Link
                href="/auth/customer/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Customer Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}