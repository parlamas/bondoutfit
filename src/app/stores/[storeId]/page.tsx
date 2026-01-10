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
  description?: string;
};

type Discount = {
  id: string;
  title: string;
  description: string | null;
  discountPercent: number | null;
  discountAmount: number | null;
  validFrom: string | null;
  validTo: string | null;
  code: string | null;
  type: string;
  minPurchase: number | null;
  maxDiscount: number | null;
  svdOnly: boolean;
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
    categoryId?: string | null;
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('none');
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<StorePublicData | null>(null);
  const [showHours, setShowHours] = useState(false);
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showDiscounts, setShowDiscounts] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, storeRes, discountsRes] = await Promise.all([
          fetch(`/api/public/store/${params.storeId}/categories`),
          fetch(`/api/stores/${params.storeId}/public`),
          fetch(`/api/public/store/${params.storeId}/discounts`),
        ]);

        if (catRes.ok) {
          const data: StoreCategory[] = await catRes.json();
          setCategories(data);
        }

        if (storeRes.ok) {
          setStore(await storeRes.json());
        }

        if (discountsRes.ok) {
          const discountData = await discountsRes.json();
          setDiscounts(discountData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.storeId]);

  useEffect(() => {
    setCategoryImages([]);

    if (selectedCategoryId === 'none') {
      return;
    }

    const loadImages = async () => {
      const res = await fetch(
        `/api/public/store/${params.storeId}/categories/${selectedCategoryId}/images?t=${Date.now()}`
      );

      if (res.ok) {
        const data = await res.json();
        setCategoryImages(data);
      }
    };

    loadImages();
  }, [selectedCategoryId, params.storeId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDiscountTypeLabel = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return '% OFF';
      case 'AMOUNT': return '€ OFF';
      case 'FREE_SHIPPING': return 'FREE SHIPPING';
      default: return 'OFF';
    }
  };

  const getDiscountValue = (discount: Discount) => {
    if (discount.discountPercent) {
      return `${discount.discountPercent}%`;
    }
    if (discount.discountAmount) {
      return `€${discount.discountAmount}`;
    }
    return 'Special Offer';
  };

  if (loading) return <p className="p-6">Loading…</p>;
  if (!store) return null;

  const storefrontImage = store.images.find(
    (img) => img.type === 'STOREFRONT'
  );

  const galleryImages = store.images.filter(
    (img) => img.type === 'GALLERY' && img.categoryId == null
  );

  // Separate SVD (Scheduled Visit Discounts) from regular discounts
  const svdDiscounts = discounts.filter(d => d.svdOnly);
  const regularDiscounts = discounts.filter(d => !d.svdOnly);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{store.name}</h1>

      {/* SCHEDULED VISIT DISCOUNTS SECTION - Add this for SVD */}
      {svdDiscounts.length > 0 && showDiscounts && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-xl font-semibold text-purple-800">Scheduled Visit Discounts</h2>
              <p className="text-purple-600 text-sm">Special discounts for scheduled visits</p>
            </div>
            <button
              onClick={() => setShowDiscounts(false)}
              className="text-purple-600 hover:text-purple-800 text-sm"
            >
              Hide
            </button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {svdDiscounts.map((discount) => (
              <div 
                key={discount.id} 
                className="bg-white border border-purple-300 rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{discount.title}</h3>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-semibold">
                    {getDiscountValue(discount)} {getDiscountTypeLabel(discount.type)}
                  </span>
                </div>
                
                {discount.description && (
                  <p className="text-gray-600 mb-3 text-sm">{discount.description}</p>
                )}
                
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Valid From:</span>
                    <span className="font-medium">{formatDate(discount.validFrom)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid To:</span>
                    <span className="font-medium">{formatDate(discount.validTo)}</span>
                  </div>
                  {discount.minPurchase && (
                    <div className="flex justify-between">
                      <span>Min. Purchase:</span>
                      <span>€{discount.minPurchase}</span>
                    </div>
                  )}
                  {discount.code && (
                    <div className="mt-2 pt-2 border-t">
                      <span className="font-semibold">Use Code:</span>
                      <span className="ml-2 bg-gray-100 px-2 py-1 rounded font-mono">
                        {discount.code}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REGULAR DISCOUNTS SECTION */}
      {regularDiscounts.length > 0 && showDiscounts && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-xl font-semibold text-blue-800">Current Offers & Discounts</h2>
              {svdDiscounts.length > 0 && (
                <p className="text-blue-600 text-sm">General discounts for all customers</p>
              )}
            </div>
            <button
              onClick={() => setShowDiscounts(false)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Hide
            </button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regularDiscounts.map((discount) => (
              <div 
                key={discount.id} 
                className="bg-white border border-blue-300 rounded-lg p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{discount.title}</h3>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">
                    {getDiscountValue(discount)} {getDiscountTypeLabel(discount.type)}
                  </span>
                </div>
                
                {discount.description && (
                  <p className="text-gray-600 mb-3 text-sm">{discount.description}</p>
                )}
                
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Valid From:</span>
                    <span className="font-medium">{formatDate(discount.validFrom)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid To:</span>
                    <span className="font-medium">{formatDate(discount.validTo)}</span>
                  </div>
                  {discount.minPurchase && (
                    <div className="flex justify-between">
                      <span>Min. Purchase:</span>
                      <span>€{discount.minPurchase}</span>
                    </div>
                  )}
                  {discount.code && (
                    <div className="mt-2 pt-2 border-t">
                      <span className="font-semibold">Use Code:</span>
                      <span className="ml-2 bg-gray-100 px-2 py-1 rounded font-mono">
                        {discount.code}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHOW DISCOUNTS BUTTON WHEN HIDDEN */}
      {!showDiscounts && discounts.length > 0 && (
        <button
          onClick={() => setShowDiscounts(true)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
        >
          Show Offers & Discounts ({discounts.length} available)
        </button>
      )}

      <div className="text-gray-600">
        <div className="font-medium">
          {store.categories?.length ? store.categories.join(', ') : null}
        </div>
        {store.description && (
          <p className="mt-1">{store.description}</p>
        )}
      </div>

      {/* Rest of your existing store page code remains the same */}
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
            <div key={image.id} className="relative group">
              <img
                src={image.imageUrl}
                alt={image.description ?? ''}
                className="w-full h-48 rounded-md object-cover"
              />
              {image.description && (
                <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs p-2 rounded-b-md">
                  {image.description}
                </div>
              )}
            </div>
          ))}

          {selectedCategoryId !== 'none' &&
            categoryImages.map((image) => (
              <div key={`${selectedCategoryId}-${image.id}`} className="relative group">
                <img
                  src={image.imageUrl}
                  alt={image.description || ''}
                  className="w-full h-48 rounded-md object-cover"
                />
                {image.description && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs p-2 rounded-b-md">
                    {image.description}
                  </div>
                )}
              </div>
            ))}
        </div>

        <div className="text-sm text-gray-700 space-y-1">
          {/* ... rest of address and contact info ... */}
        </div>
      </div>

      {/* CATEGORY DROPDOWN and OPENING HOURS remain the same */}
      {/* ... */}
    </div>
  );
}