// src/app/stores/[storeId]/page.tsx

'use client';

import { useEffect, useState } from 'react';

type StoreCategory = {
  id: string;
  title: string;
};

type CategoryImage = {
  id: string;
  imageUrl: string;
};


type StorePublicData = {
  name: string;
  description: string | null;
  categories: string[];
  images: {
  id: string;
  imageUrl: string;
  type: string;
  description: string | null;
}[];
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
  openingHours: { [key: string]: any } | null;
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
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);

  useEffect(() => {
    const load = async () => {
      const [catRes, storeRes] = await Promise.all([
        fetch(`/api/public/store/${params.storeId}/categories`),
        fetch(`/api/stores/${params.storeId}/public`),
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
  }, [params.storeId]);

  useEffect(() => {
  if (!selectedCategoryId) {
    setCategoryImages([]);
    return;
  }

  const loadImages = async () => {
    const res = await fetch(
      `/api/public/store/${params.storeId}/categories/${selectedCategoryId}/images`
    );

    if (res.ok) {
      const data = await res.json();
      setCategoryImages(data);
    } else {
      setCategoryImages([]);
    }
  };

  loadImages();
}, [selectedCategoryId, params.storeId]);


  if (loading) return <p className="p-6">Loading…</p>;
  if (!store) return null;
const storefrontImage = store.images.find(
  (img) => img.type === 'STOREFRONT'
);

const galleryImages = store.images.filter(
  (img) => img.type === 'GALLERY'
);


  

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{store.name}</h1>

      <div className="text-gray-600">
        <div className="font-medium">
          {store.categories?.length ? store.categories.join(', ') : null}
        </div>
        {store.description && (
          <p className="mt-1">{store.description}</p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="grid grid-cols-2 gap-4 max-w-md">

  {storefrontImage && (
    <img
      src={storefrontImage.imageUrl}
      alt="Storefront"
      className="w-full h-48 rounded-md object-cover"
    />
  )}

  {galleryImages.map((image) => (
    <div key={image.id} className="space-y-1">
      <img
        src={image.imageUrl}
        alt={image.description ?? ''}
        className="w-full h-48 rounded-md object-cover"
      />
      {image.description && (
        <p className="text-xs text-gray-600">{image.description}</p>
      )}
    </div>
  ))}

  {categoryImages.map((image) => (
    <img
      key={image.id}
      src={image.imageUrl}
      alt=""
      className="w-full h-48 rounded-md object-cover"
    />
  ))}

</div>


        <div className="text-sm text-gray-700 space-y-1">
          <div>
            {store.street} {store.streetNumber}
            {store.floor && `, Floor ${store.floor}`}
          </div>
          <div>
            {store.zip} {store.city}, {store.country}
          </div>

          {store.phoneNumber && (
            <div>
              {store.phoneCountry} {store.phoneArea} {store.phoneNumber}
            </div>
          )}

          {store.email && <div>{store.email}</div>}

          {store.website && (
  <a
    href={store.website}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 hover:text-blue-800 transition-colors"
  >
    Visit website
  </a>
)}

        </div>
      </div>

      {/* CATEGORY DROPDOWN */}
      <div className="flex items-center gap-4">
        <select
  value={selectedCategoryId ?? 'none'}
  onChange={(e) => {
    const value = e.target.value;
    setSelectedCategoryId(value === 'none' ? null : value);
  }}
  className="border rounded px-3 py-2"
>
  <option value="none">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setShowHours((prev) => !prev)}
          className="border px-3 py-2 rounded text-sm hover:bg-gray-50"
        >
          Opening Hours
        </button>
      </div>

      {showHours && store.openingHours && (
        <div className="border rounded-md p-4 text-sm text-gray-700 space-y-1 max-w-sm">
          {Object.entries(store.openingHours).map(([day, value]) => {
            const dayNames = [
              'Sunday',
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
            ];

            const label = Number.isInteger(Number(day))
              ? dayNames[Number(day)]
              : day;

            return (
              <div key={day} className="flex justify-between">
                <span className="font-medium">{label}</span>
                <span>
                  {typeof value === 'string'
                    ? value
                    : Array.isArray(value)
                    ? value.join(' – ')
                    : value?.open && value?.close
                    ? `${value.open} – ${value.close}`
                    : 'Closed'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
