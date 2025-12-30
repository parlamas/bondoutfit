// src/app/stores/[storeId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type StoreItemImage = {
  id: string;
  imageUrl: string;
};

type StoreItem = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number | null;
  images: StoreItemImage[];
};

export default function StorePublicPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/stores/${storeId}/items`)
      .then(res => res.json())
      .then(data => setItems(data))
      .finally(() => setLoading(false));
  }, [storeId]);

  if (loading) {
    return <div className="p-6">Loading store items…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Store Items</h1>

      {items.length === 0 ? (
        <p className="text-gray-600">No items available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(item => (
            <div
              key={item.id}
              className="border rounded-lg bg-white p-4"
            >
              {item.images[0] && (
                <img
                  src={item.images[0].imageUrl}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}

              <div className="font-medium">{item.name}</div>

              <div className="text-sm text-gray-600">
                {item.category}
              </div>

              {item.description && (
                <div className="mt-2 text-sm text-gray-700">
                  {item.description}
                </div>
              )}

              {item.price !== null && (
                <div className="mt-2 font-medium">
                  € {(item.price / 100).toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
