// src/app/stores/[storeId]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  status: string;
  isActive: boolean;
};

type StorePublicData = {
  id: string;
  storeName: string;
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
  state: string;
  zip: string;
  country: string;
  phoneCountry: string;
  phoneArea: string;
  phoneNumber: string;
  email: string | null;
  website: string | null;
  openingHours: Array<{day?: number; open?: string; close?: string; closed?: boolean}> | null;
  acceptedCurrencies: string[];
  items: any[];
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
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showDiscounts, setShowDiscounts] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const storeUrl = `/api/stores/${params.storeId}/public`;
        const storeRes = await fetch(storeUrl);

        if (storeRes.ok) {
          const storeData = await storeRes.json();
          setStore(storeData);
        }

        const discountsUrl = `/api/public/store/${params.storeId}/discounts`;
        const discountsRes = await fetch(discountsUrl);

        if (discountsRes.ok) {
          const discountData = await discountsRes.json();
          setDiscounts(discountData);
        }

        const categoriesUrl = `/api/public/store/${params.storeId}/categories`;
        const catRes = await fetch(categoriesUrl);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
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

  const isFutureDiscount = (discount: Discount) => {
    if (!discount.validFrom) return false;
    return new Date(discount.validFrom) > new Date();
  };

  const handleBookVisitClick = () => {
    if (status === 'unauthenticated') {
      router.push(`/auth/customer/signin?callbackUrl=/schedule/${params.storeId}`);
      return;
    }
    // Redirect to the new schedule page with image upload
    router.push(`/schedule/${params.storeId}`);
  };

  const handleDiscountBooking = (discount: Discount) => {
    if (status === 'unauthenticated') {
      router.push(`/auth/customer/signin?callbackUrl=/schedule/${params.storeId}?discountId=${discount.id}`);
      return;
    }
    // Redirect to the new schedule page with the discount pre-selected
    router.push(`/schedule/${params.storeId}?discountId=${discount.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-paper flex items-center justify-center">
        <p className="text-brand-inksoft font-sans">Loading…</p>
      </div>
    );
  }
  if (!store) return null;

  const storefrontImage = store.images.find(
    (img) => img.type === 'STOREFRONT'
  );

  const galleryImages = store.images.filter(
    (img) => img.type === 'GALLERY' && img.categoryId == null
  );

  const svdDiscounts = discounts.filter(d => d.svdOnly);
  const regularDiscounts = discounts.filter(d => !d.svdOnly);

  return (
    <div className="min-h-screen bg-brand-paper">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex flex-col gap-3 pb-6 border-b border-brand-stoneborder">
          <h1 className="font-serif text-4xl font-semibold text-brand-ink">{store.storeName}</h1>

          {Array.isArray(store.categories) && store.categories.length > 0 && (
            <div className="text-sm font-sans tracking-wide uppercase text-brand-inksoft">
              {store.categories.join(' · ')}
            </div>
          )}

          {store.description && (
            <p className="text-brand-inksoft max-w-3xl font-sans leading-relaxed">
              {store.description}
            </p>
          )}
        </div>

        {svdDiscounts.length > 0 && showDiscounts && (
          <div className="bg-brand-goldsoft border border-brand-gold/30 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-serif text-xl font-semibold text-brand-golddeep">Scheduled Visit Rewards</h2>
                <p className="text-brand-inksoft text-sm font-sans">Reserved for customers who book ahead</p>
              </div>
              <button
                onClick={() => setShowDiscounts(false)}
                className="text-brand-golddeep hover:text-brand-ink text-sm font-sans transition-colors"
              >
                Hide
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {svdDiscounts.map((discount) => (
                <div
                  key={discount.id}
                  className="bg-brand-paper border border-brand-gold/40 rounded-xl p-5 shadow-sm flex flex-col h-full relative"
                >
                  {isFutureDiscount(discount) && (
                    <div className="absolute top-3 right-3 bg-brand-goldsoft text-brand-golddeep text-xs font-sans font-semibold px-2 py-1 rounded-full border border-brand-gold/40 z-10">
                      Starts {formatDate(discount.validFrom)}
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-serif font-semibold text-lg text-brand-ink">{discount.title}</h3>
                      <span className="bg-brand-gold text-white px-2.5 py-1 rounded-full text-sm font-sans font-semibold whitespace-nowrap">
                        {getDiscountValue(discount)} {getDiscountTypeLabel(discount.type)}
                      </span>
                    </div>

                    {discount.description && (
                      <p className="text-brand-inksoft mb-3 text-sm font-sans">{discount.description}</p>
                    )}

                    <div className="space-y-1.5 text-xs font-sans text-brand-inksoft">
                      <div className="flex justify-between">
                        <span>Valid From</span>
                        <span className="font-medium text-brand-ink">{formatDate(discount.validFrom)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valid To</span>
                        <span className="font-medium text-brand-ink">{formatDate(discount.validTo)}</span>
                      </div>
                      {discount.minPurchase && (
                        <div className="flex justify-between">
                          <span>Min. Purchase</span>
                          <span className="text-brand-ink">€{discount.minPurchase}</span>
                        </div>
                      )}
                      {discount.code && (
                        <div className="mt-2 pt-2 border-t border-brand-stoneborder">
                          <span className="font-semibold text-brand-ink">Code:</span>
                          <span className="ml-2 bg-brand-stone px-2 py-1 rounded font-mono">
                            {discount.code}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDiscountBooking(discount)}
                    disabled={isFutureDiscount(discount)}
                    className={`w-full mt-4 font-sans ${
                      isFutureDiscount(discount)
                        ? 'bg-brand-stone cursor-not-allowed text-brand-inksoft'
                        : 'bg-brand-gold hover:bg-brand-golddeep text-white'
                    } px-4 py-2.5 rounded-lg font-medium transition-colors`}
                  >
                    {isFutureDiscount(discount) ? 'Starts Soon' : 'Book Visit'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {regularDiscounts.length > 0 && showDiscounts && (
          <div className="bg-brand-stone border border-brand-stoneborder rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-serif text-xl font-semibold text-brand-ink">Current Offers</h2>
                {svdDiscounts.length > 0 && (
                  <p className="text-brand-inksoft text-sm font-sans">Available to all customers</p>
                )}
              </div>
              <button
                onClick={() => setShowDiscounts(false)}
                className="text-brand-inksoft hover:text-brand-ink text-sm font-sans transition-colors"
              >
                Hide
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regularDiscounts.map((discount) => (
                <div
                  key={discount.id}
                  className="bg-brand-paper border border-brand-stoneborder rounded-xl p-5 shadow-sm flex flex-col h-full relative"
                >
                  {isFutureDiscount(discount) && (
                    <div className="absolute top-3 right-3 bg-brand-goldsoft text-brand-golddeep text-xs font-sans font-semibold px-2 py-1 rounded-full border border-brand-gold/40 z-10">
                      Starts {formatDate(discount.validFrom)}
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-serif font-semibold text-lg text-brand-ink">{discount.title}</h3>
                      <span className="bg-brand-stoneborder text-brand-ink px-2.5 py-1 rounded-full text-sm font-sans font-semibold whitespace-nowrap">
                        {getDiscountValue(discount)} {getDiscountTypeLabel(discount.type)}
                      </span>
                    </div>

                    {discount.description && (
                      <p className="text-brand-inksoft mb-3 text-sm font-sans">{discount.description}</p>
                    )}

                    <div className="space-y-1.5 text-xs font-sans text-brand-inksoft">
                      <div className="flex justify-between">
                        <span>Valid From</span>
                        <span className="font-medium text-brand-ink">{formatDate(discount.validFrom)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valid To</span>
                        <span className="font-medium text-brand-ink">{formatDate(discount.validTo)}</span>
                      </div>
                      {discount.minPurchase && (
                        <div className="flex justify-between">
                          <span>Min. Purchase</span>
                          <span className="text-brand-ink">€{discount.minPurchase}</span>
                        </div>
                      )}
                      {discount.code && (
                        <div className="mt-2 pt-2 border-t border-brand-stoneborder">
                          <span className="font-semibold text-brand-ink">Code:</span>
                          <span className="ml-2 bg-brand-stone px-2 py-1 rounded font-mono">
                            {discount.code}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDiscountBooking(discount)}
                    disabled={isFutureDiscount(discount)}
                    className={`w-full mt-4 font-sans ${
                      isFutureDiscount(discount)
                        ? 'bg-brand-stoneborder cursor-not-allowed text-brand-inksoft'
                        : 'bg-brand-ink hover:bg-brand-inksoft text-white'
                    } px-4 py-2.5 rounded-lg font-medium transition-colors`}
                  >
                    {isFutureDiscount(discount) ? 'Starts Soon' : 'Book Visit'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showDiscounts && discounts.length > 0 && (
          <button
            onClick={() => setShowDiscounts(true)}
            className="w-full bg-brand-stone hover:bg-brand-stoneborder text-brand-ink font-sans py-2.5 rounded-lg transition-colors"
          >
            Show Offers & Discounts ({discounts.length} available)
          </button>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {storefrontImage && (
              <img
                src={storefrontImage.imageUrl}
                alt="Storefront"
                className="w-full h-48 rounded-lg object-cover border border-brand-stoneborder"
              />
            )}

            {galleryImages.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.imageUrl}
                  alt={image.description ?? ''}
                  className="w-full h-48 rounded-lg object-cover border border-brand-stoneborder"
                />
                {image.description && (
                  <div className="absolute inset-x-0 bottom-0 bg-brand-ink/70 text-white text-xs font-sans p-2 rounded-b-lg">
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
                    className="w-full h-48 rounded-lg object-cover border border-brand-stoneborder"
                  />
                  {image.description && (
                    <div className="absolute inset-x-0 bottom-0 bg-brand-ink/70 text-white text-xs font-sans p-2 rounded-b-lg">
                      {image.description}
                    </div>
                  )}
                </div>
              ))}
          </div>

          <div className="flex-1 space-y-6 font-sans">
            <div>
              <h3 className="font-serif font-semibold text-brand-ink mb-2">Browse Categories</h3>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full border border-brand-stoneborder bg-brand-paper rounded-lg px-4 py-2.5 text-brand-ink focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              >
                <option value="none">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="border border-brand-stoneborder rounded-xl p-5 bg-brand-stone/40">
              <h3 className="font-serif font-semibold text-brand-ink mb-3">Contact Information</h3>

              <div className="space-y-3 text-sm text-brand-inksoft">
                <div>
                  <div className="font-medium text-brand-ink">Address</div>
                  <div>
                    {store.street} {store.streetNumber}
                    {store.floor && `, Floor ${store.floor}`}
                    <br />
                    {store.zip} {store.city}, {store.country}
                  </div>
                </div>

                {store.phoneNumber && (
                  <div>
                    <div className="font-medium text-brand-ink">Phone</div>
                    <div>
                      {store.phoneCountry} {store.phoneArea} {store.phoneNumber}
                    </div>
                  </div>
                )}

                {store.email && (
                  <div>
                    <div className="font-medium text-brand-ink">Email</div>
                    <a
                      href={`mailto:${store.email}`}
                      className="text-brand-gold hover:text-brand-golddeep transition-colors"
                    >
                      {store.email}
                    </a>
                  </div>
                )}

                {store.website && (
                  <div>
                    <div className="font-medium text-brand-ink">Website</div>
                    <a
                      href={store.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-gold hover:text-brand-golddeep transition-colors"
                    >
                      {store.website}
                    </a>
                  </div>
                )}

                {store.acceptedCurrencies && Array.isArray(store.acceptedCurrencies) && store.acceptedCurrencies.length > 0 && (
                  <div>
                    <div className="font-medium text-brand-ink">Accepted Currencies</div>
                    <div>
                      {store.acceptedCurrencies.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {store.openingHours && Array.isArray(store.openingHours) && (
              <div className="border border-brand-stoneborder rounded-xl p-5 bg-brand-stone/40">
                <h3 className="font-serif font-semibold text-brand-ink mb-3">Opening Hours</h3>
                <div className="text-sm text-brand-inksoft space-y-2">
                  {store.openingHours.map((hourObj, index) => {
                    const day = hourObj?.day ?? index;
                    const open = hourObj?.open ?? '';
                    const close = hourObj?.close ?? '';
                    const closed = hourObj?.closed ?? false;

                    const dayNames = [
                      'Sunday', 'Monday', 'Tuesday', 'Wednesday',
                      'Thursday', 'Friday', 'Saturday'
                    ];
                    const label = dayNames[day] || `Day ${day}`;

                    let displayText = 'Closed';
                    if (closed === true) {
                      displayText = 'Closed';
                    } else if (open && close) {
                      const openStr = String(open);
                      const closeStr = String(close);
                      displayText = `${openStr} – ${closeStr}`;
                    } else if (closed === false) {
                      displayText = 'Hours not specified';
                    }

                    return (
                      <div key={index} className="flex justify-between items-center">
                        <span className="font-medium text-brand-ink">{label}</span>
                        <span>
                          {displayText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Book a Visit Button */}
            <button
              onClick={handleBookVisitClick}
              className="w-full bg-brand-ink hover:bg-brand-golddeep text-white font-serif font-semibold py-3.5 px-4 rounded-lg transition-colors text-lg"
            >
              Book a Visit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


