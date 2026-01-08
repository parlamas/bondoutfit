// src/app/stores/[storeId]/page.tsx

'use client';

import { useEffect, useState } from 'react';

type StoreCategory = {
  id: string;
  title: string;
};


export default function StorePage({
  params,
}: {
  params: { storeId: string };
}) {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/public/store/${params.storeId}/categories`);
      if (res.ok) {
        const data: StoreCategory[] = await res.json();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      }
      setLoading(false);
    };

    load();
  }, []);

  if (loading) return <p className="p-6">Loading…</p>;

  

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Store</h1>

      <div className="max-w-xs">
  <img
    src="/storefront.jpg"
    alt="Storefront"
    className="w-full h-auto rounded-md"
  />
</div>


      {/* CATEGORY DROPDOWN */}
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

      
    </div>
  );
}
