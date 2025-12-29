//src/app/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, Shield } from 'lucide-react';

function StoreSelector() {
  const [stores, setStores] = useState<
    { id: string; name: string; country: string; city: string }[]
  >([]);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [storeId, setStoreId] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetch("/api/stores")
      .then(res => res.json())
      .then(setStores)
      .catch(() => setStores([]));
  }, []);

  const countries = Array.from(new Set(stores.map(s => s.country)));
  const cities = Array.from(
    new Set(stores.filter(s => s.country === country).map(s => s.city))
  );
  const filteredStores = stores.filter(
    s => s.country === country && s.city === city
  );

  return (
    <section className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Schedule a Visit & Get a Discount
        </h2>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <select
            value={country}
            onChange={e => {
              setCountry(e.target.value);
              setCity("");
              setStoreId("");
            }}
            className="w-full border rounded-md p-2"
          >
            <option value="">Select country</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* City */}
        {country && (
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <select
              value={city}
              onChange={e => {
                setCity(e.target.value);
                setStoreId("");
              }}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select city</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Store */}
        {city && (
          <div>
            <label className="block text-sm font-medium mb-1">Store</label>
            <select
              value={storeId}
              onChange={e => setStoreId(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select store</option>
              {filteredStores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* CTA */}
        {storeId && (
          <button
            onClick={() => router.push(`/schedule/${storeId}`)}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            View Store & Schedule Visit
          </button>
        )}
      </div>
    </section>
  );
}

function IntroSection() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Customers */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-8 w-8 text-blue-600" />
          <h3 className="text-xl font-semibold">For Customers</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          With <strong>Scheduled Visit Discount (SVD)</strong>, you book a store
          visit in advance. If you arrive on time and make a purchase, you
          receive a pre-agreed discount. No waiting, no uncertainty, better
          prices.
        </p>
      </div>

      {/* Store Managers */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-gray-800" />
          <h3 className="text-xl font-semibold">For Store Managers</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          SVD turns planned visits into predictable demand. You know who is
          coming, when, and why. Discounts are offset by higher conversion,
          smoother operations, and better use of staff and space.
        </p>
      </div>
    </section>
  );
}


/* =========================
   HOME PAGE
========================= */

export default function HomePage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const router = useRouter();

  // Redirect store managers away from home
  useEffect(() => {
    if (role === "STORE_MANAGER") {
      router.replace("/dashboard/store");
    }
  }, [role, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {role !== "STORE_MANAGER" && <StoreSelector />}
      <IntroSection />
    </div>
  );
}
