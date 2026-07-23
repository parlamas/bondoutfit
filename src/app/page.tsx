// src/app/page.tsx - COMPLETE CORRECTED VERSION

'use client';

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, Shield } from 'lucide-react';
import MobileMenu from "./components/MobileMenu";
import { useTranslations } from 'next-intl';

function StoreSelector() {
  const t = useTranslations('HomePage');
  const [stores, setStores] = useState<
    { id: string; storeName: string; country: string; city: string }[] // FIXED: Changed 'name' to 'storeName'
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
    <section className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-10">
      <div className="bg-brand-paper border border-brand-stoneborder rounded-xl shadow-sm p-5 sm:p-7 space-y-5 sm:space-y-6">
        <h2 className="font-serif text-2xl font-semibold text-brand-ink">
          {t('scheduleHeading')}
        </h2>

        {/* Country */}
        <div>
          <label className="block text-sm font-sans font-medium text-brand-ink mb-1.5">{t('country')}</label>
          <select
            value={country}
            onChange={e => {
              setCountry(e.target.value);
              setCity("");
              setStoreId("");
            }}
            className="w-full border border-brand-stoneborder bg-white rounded-lg p-2.5 font-sans text-brand-ink focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
          >
            <option value="">{t('selectCountry')}</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* City */}
        {country && (
          <div>
            <label className="block text-sm font-sans font-medium text-brand-ink mb-1.5">{t('city')}</label>
            <select
              value={city}
              onChange={e => {
                setCity(e.target.value);
                setStoreId("");
              }}
              className="w-full border border-brand-stoneborder bg-white rounded-lg p-2.5 font-sans text-brand-ink focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
            >
              <option value="">{t('selectCity')}</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Store */}
        {city && (
          <div>
            <label className="block text-sm font-sans font-medium text-brand-ink mb-1.5">{t('store')}</label>
            <select
              value={storeId}
              onChange={e => setStoreId(e.target.value)}
              className="w-full border border-brand-stoneborder bg-white rounded-lg p-2.5 font-sans text-brand-ink focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
            >
              <option value="">{t('selectStore')}</option>
              {filteredStores.map(s => (
                <option key={s.id} value={s.id}>{s.storeName}</option> // FIXED: Changed s.name to s.storeName
              ))}
            </select>
          </div>
        )}

        {/* CTA */}
        {storeId && (
          <button
            onClick={() => router.push(`/stores/${storeId}`)}
            className="w-full bg-brand-ink hover:bg-brand-golddeep text-white py-3 rounded-lg text-base font-serif font-semibold transition-colors"
          >
            {t('viewStoreCta')}
          </button>
        )}
      </div>
    </section>
  );
}

function IntroSection() {
  const t = useTranslations('HomePage');
  return (
    <section className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      {/* Customers */}
      <div className="bg-brand-paper border border-brand-stoneborder rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-7 w-7 text-brand-gold" />
          <h3 className="font-serif text-xl font-semibold text-brand-ink">{t('forCustomers')}</h3>
        </div>
        <p className="text-brand-inksoft font-sans leading-relaxed">
          {t.rich('customersText', {
            strong: (chunks) => <strong className="text-brand-ink">{chunks}</strong>
          })}
        </p>
      </div>

      {/* Store Managers */}
      <div className="bg-brand-paper border border-brand-stoneborder rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-7 w-7 text-brand-ink" />
          <h3 className="font-serif text-xl font-semibold text-brand-ink">{t('forStoreManagers')}</h3>
        </div>
        <p className="text-brand-inksoft font-sans leading-relaxed">
          {t('managersText')}
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
    <div className="min-h-screen bg-brand-stone pt-14 md:pt-0">
      <MobileMenu />
      {role !== "STORE_MANAGER" && <StoreSelector />}
      <IntroSection />
    </div>
  );
}





