// app/page.tsx - Complete file

import Link from "next/link";
import { Calendar, Clock, Tag, Users, Store, Shield } from "lucide-react";
import AuthSection from "./components/AuthSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">BondOutfit</span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                SVD
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                About SVD
              </Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900">
                How It Works
              </Link>
              <Link href="/stores" className="text-gray-600 hover:text-gray-900">
                Stores
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">BondOutfit</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Introducing <span className="font-bold text-blue-600">Scheduled Visit Discount (SVD)</span> - 
            Book your store visit in advance and unlock exclusive discounts!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Schedule Your Visit</h3>
              <p className="text-gray-600">Pick a date and time that works for you</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Visit as Scheduled</h3>
              <p className="text-gray-600">Show up at your chosen time and store</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Tag className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Get Exclusive Discounts</h3>
              <p className="text-gray-600">Enjoy special discounts for scheduled visitors</p>
            </div>
          </div>
        </div>

        {/* Dual Authentication Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Customer Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-8">
              <Users className="h-10 w-10 text-blue-600 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">For Customers</h2>
                <p className="text-gray-600">Find stores and schedule visits for discounts</p>
              </div>
            </div>
            <AuthSection type="customer" />
          </div>

          {/* Store Manager Section */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <div className="flex items-center mb-8">
              <Shield className="h-10 w-10 text-blue-600 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">For Store Managers</h2>
                <p className="text-gray-600">Manage SVD offers and track scheduled visits</p>
              </div>
            </div>
            <AuthSection type="store-manager" />
          </div>
        </div>

        {/* How SVD Works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How Scheduled Visit Discount Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-blue-600 text-xl">1</span>
              </div>
              <h3 className="font-bold mb-2">Store Announces SVD</h3>
              <p className="text-sm text-gray-600">Manager sets discount for scheduled visits</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-blue-600 text-xl">2</span>
              </div>
              <h3 className="font-bold mb-2">Customer Schedules Visit</h3>
              <p className="text-sm text-gray-600">Pick date & time through BondOutfit</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-blue-600 text-xl">3</span>
              </div>
              <h3 className="font-bold mb-2">Customer Visits Store</h3>
              <p className="text-sm text-gray-600">Show up as scheduled at the store</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-blue-600 text-xl">4</span>
              </div>
              <h3 className="font-bold mb-2">Discount Applied</h3>
              <p className="text-sm text-gray-600">Get exclusive discount on purchases</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2">
                <Store className="h-8 w-8 text-white" />
                <span className="text-2xl font-bold">BondOutfit</span>
              </div>
              <p className="text-gray-400 mt-2">Revolutionizing retail with SVD</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2024 BondOutfit. All rights reserved.</p>
              <p className="text-gray-500 text-sm mt-1">bondoutfit.com</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}// Force rebuild 12/28/2025 02:16:39
