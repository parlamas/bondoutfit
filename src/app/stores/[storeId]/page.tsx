// src/app/stores/[storeId]/page.tsx

'use client';

import { useEffect, useState } from 'react';

type StoreCategory = {
  id: string;
  title: string;
};

type StorePublicData = {
  name: string;
  description: string | null;
  categories: string[];
  street: string;
  streetNumber: string;
  floor: string | null;
  city: string;
  zip: string;
  country: string;
  phoneCountry: string | null;
  phoneArea: string | null;
  phoneNumber: string | null;
  email: string | null;
  website: string | null;
  openingHours: Record<
  string,
  string | string[] | { open: string; close: string }
> | null;
};



export default function StorePage({
  params,
}: {
  params: { storeId: string };
}) {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<StorePublicData | null>(null);
  const [showHours, setShowHours] = useState(false);



  useEffect(() => {
    const load = async () => {
  const [catRes, storeRes] = await Promise.all([
    fetch(`/api/public/store/${params.storeId}/categories`),
    fetch(`/api/stores/${params.storeId}/public`)
  ]);

  if (catRes.ok) {
    const data: StoreCategory[] = await catRes.json();
    setCategories(data);
    if (data.length > 0) {
      setSelectedCategoryId(data[0].id);
    }
  }

  if (storeRes.ok) {
    setStore(await storeRes.json());
  }

  setLoading(false);
};


    load();
  }, []);

  if (loading) return <p className="p-6">Loading…</p>;

  if (!store) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{store?.name}</h1>

<div className="text-gray-600">
  <div className="font-medium">
    {store?.categories?.length
  ? store.categories.join(", ")
  : null}

  </div>
  {store?.description && (
    <p className="mt-1">{store.description}</p>
  )}
</div>


      <div className="flex flex-col md:flex-row gap-6">
  <div className="max-w-xs">
    <img
      src="/storefront.jpg"
      alt="Storefront"
      className="w-full h-auto rounded-md"
    />
  </div>

  <div className="text-sm text-gray-700 space-y-1">
    <div>
      {store?.street} {store?.streetNumber}
      {store?.floor && `, Floor ${store.floor}`}
    </div>
    <div>
      {store?.zip} {store?.city}, {store?.country}
    </div>

    {store?.phoneNumber && (
      <div>
        {store.phoneCountry} {store.phoneArea} {store.phoneNumber}
      </div>
    )}

    {store?.email && <div>{store.email}</div>}
    {store?.website && (
      <a
  href={store.website}
  className="text-blue-600 underline"
  target="_blank"
  rel="noopener noreferrer"
>

        {store.website}
      </a>
    )}
  </div>
</div>

      {/* CATEGORY DROPDOWN */}
      <div className="flex items-center gap-4">
  <select
    value={selectedCategoryId ?? ''}
    onChange={(e) => setSelectedCategoryId(e.target.value)}
    className="border rounded px-3 py-2"
  >

        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.title}
          </option>
        ))}
      </select>
        <button
  type="button"
  onClick={() => setShowHours(prev => !prev)}
  className="border px-3 py-2 rounded text-sm hover:bg-gray-50"
>
  Opening Hours
</button>

</div>

{showHours && store.openingHours && (
  <div className="border rounded-md p-4 text-sm text-gray-700 space-y-1 max-w-sm">
    {Object.entries(store.openingHours).map(([day, value]) => {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const label = Number.isInteger(Number(day))
    ? dayNames[Number(day)]
    : day;

  return (
    <div key={day} className="flex justify-between">
      <span className="font-medium">{label}</span>

        <span>
          {typeof value === "string"
            ? value
            : Array.isArray(value)
            ? value.join(" – ")
            : value?.open && value?.close
            ? `${value.open} – ${value.close}`
            : "Closed"}
        </span>
      </div>
    ))}
  </div>
)}
    </div>
  );
}
