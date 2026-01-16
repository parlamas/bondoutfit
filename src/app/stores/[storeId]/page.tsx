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
  status: string; // ADD THIS LINE
  isActive: boolean; // ADD THIS LINE
};

type StorePublicData = {
  id: string;
  storeName: string; // CHANGED FROM 'name' TO 'storeName'
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
  openingHours: { [key: string]: any } | null;
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
  const [showHours, setShowHours] = useState(true);
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showDiscounts, setShowDiscounts] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [visitSubmitted, setVisitSubmitted] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    numberOfVisitors: 1,
  });
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>('');

  useEffect(() => {
  const load = async () => {
    try {
      console.log('=== DEBUGGING STORE PAGE ===');
      console.log('Store ID:', params.storeId);
      
      // Test each endpoint separately
      const storeUrl = `/api/stores/${params.storeId}/public`;
      console.log('Fetching store from:', storeUrl);
      
      const storeRes = await fetch(storeUrl);
      console.log('Store response status:', storeRes.status);
      console.log('Store response ok:', storeRes.ok);
      
      if (storeRes.ok) {
        const storeData = await storeRes.json();
        console.log('Store data received:', storeData);
        console.log('Store name:', storeData.storeName);
        console.log('Store has name property?', 'name' in storeData);
        setStore(storeData);
      } else {
        console.log('Store fetch failed with status:', storeRes.status);
        const errorText = await storeRes.text();
        console.log('Error response:', errorText);
      }
      
      // Check discounts
const discountsUrl = `/api/public/store/${params.storeId}/discounts`;
console.log('\nFetching discounts from:', discountsUrl);

const discountsRes = await fetch(discountsUrl);
console.log('Discounts response status:', discountsRes.status);

if (discountsRes.ok) {
  const discountData = await discountsRes.json();
  console.log('Discounts received from API:', discountData);
  console.log('Number of discounts:', discountData.length);
  
  // Debug each discount
  discountData.forEach((discount: Discount, index: number) => {
    console.log(`Discount ${index + 1}:`, {
      title: discount.title,
      status: discount.status,
      isActive: discount.isActive,
      validFrom: discount.validFrom,
      validTo: discount.validTo,
      svdOnly: discount.svdOnly,
      type: discount.type
    });
  });
  
  setDiscounts(discountData);
} else {
  const errorText = await discountsRes.text();
  console.log('Discounts error:', errorText);
}
      
      // Check categories
      const categoriesUrl = `/api/public/store/${params.storeId}/categories`;
      console.log('\nFetching categories from:', categoriesUrl);
      
      const catRes = await fetch(categoriesUrl);
      console.log('Categories response status:', catRes.status);
      
      if (catRes.ok) {
        const catData = await catRes.json();
        console.log('Categories received:', catData.length);
        setCategories(catData);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      console.log('=== END DEBUGGING ===');
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

  useEffect(() => {
  console.log('Current discounts in state:', discounts);
}, [discounts]);

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
      router.push('/auth/customer/signin');
      return;
    }
    setShowBookingForm(true);
  };

    const handleDiscountBooking = (discount: Discount) => {
    if (status === 'unauthenticated') {
      router.push('/auth/customer/signin');
      return;
    }
    setSelectedDiscountId(discount.id);
    setShowBookingForm(true);
  };

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: name === 'numberOfVisitors' ? parseInt(value) : value,
    }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingBooking(true);

    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
          storeId: params.storeId,
          scheduledDate: bookingData.date,
          scheduledTime: bookingData.time,
          numberOfPeople: bookingData.numberOfVisitors,
          discountId: selectedDiscountId,
        }),
      });

      if (res.ok) {
        const visit = await res.json();
        setVisitSubmitted(true);
        setShowBookingForm(false);
        // Redirect to visit details page
        router.push(`/visits/${visit.id}`);
      }
    } catch (error) {
      console.error('Error booking visit:', error);
    } finally {
      setLoadingBooking(false);
    }
  };

  if (loading) return <p className="p-6">Loading…</p>;
  if (!store) return null;

    //useEffect(() => {
    //console.log('Store data in component:', store);
    //console.log('Store email in component:', store?.email);
    //console.log('Accepted currencies:', store?.acceptedCurrencies);
    //console.log('Type of acceptedCurrencies:', typeof store?.acceptedCurrencies);
    //console.log('Is array?', Array.isArray(store?.acceptedCurrencies));
  //}, [store]);

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
      
      <h1 className="text-3xl font-bold">{store.storeName}</h1>

      {/* SCHEDULED VISIT DISCOUNTS SECTION */}
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
  className="bg-white border border-purple-300 rounded-lg p-4 shadow-sm flex flex-col h-full relative"
>
  {/* Future Discount Badge */}
  {isFutureDiscount(discount) && (
    <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded border border-yellow-200 z-10">
      ⏰ Starts {formatDate(discount.validFrom)}
    </div>
  )}
  <div className="flex-grow">
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
  
 <button
  onClick={() => handleDiscountBooking(discount)}
  disabled={isFutureDiscount(discount)}
  className={`w-full mt-4 ${
    isFutureDiscount(discount)
      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
      : 'bg-purple-600 hover:bg-purple-700 text-white'
  } px-4 py-2 rounded-lg font-medium transition-colors`}
>
  {isFutureDiscount(discount) ? 'Starts Soon' : 'Book Visit'}
</button>
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
  className="bg-white border border-purple-300 rounded-lg p-4 shadow-sm flex flex-col h-full relative"
>
  {/* Future Discount Badge */}
  {isFutureDiscount(discount) && (
    <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded border border-yellow-200 z-10">
      ⏰ Starts {formatDate(discount.validFrom)}
    </div>
  )}
  <div className="flex-grow">
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
  
  <button
  onClick={() => handleDiscountBooking(discount)}
  disabled={isFutureDiscount(discount)}
  className={`w-full mt-4 ${
    isFutureDiscount(discount)
      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
      : 'bg-purple-600 hover:bg-purple-700 text-white'
  } px-4 py-2 rounded-lg font-medium transition-colors`}
>
  {isFutureDiscount(discount) ? 'Starts Soon' : 'Book Visit'}
</button>
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

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* IMAGES SECTION */}
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

        {/* CONTACT & CATEGORIES SECTION */}
        <div className="flex-1 space-y-6">
          {/* CATEGORY DROPDOWN */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Browse Categories</h3>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">No category (no category images shown)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          {/* CONTACT INFORMATION */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
            
            <div className="space-y-3 text-sm text-gray-700">
              {/* Full Address with Floor */}
              <div>
                <div className="font-medium text-gray-600">Address</div>
                <div className="text-gray-900">
                  {store.street} {store.streetNumber}
                  {store.floor && `, Floor ${store.floor}`}
                  <br />
                  {store.zip} {store.city}, {store.country}
                </div>
              </div>

              {/* Full Phone Number */}
              {store.phoneNumber && (
                <div>
                  <div className="font-medium text-gray-600">Phone</div>
                  <div className="text-gray-900">
                    {store.phoneCountry} {store.phoneArea} {store.phoneNumber}
                  </div>
                </div>
              )}

              {/* Email */}
              {store.email && (
                <div>
                  <div className="font-medium text-gray-600">Email</div>
                  <a 
                    href={`mailto:${store.email}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {store.email}
                  </a>
                </div>
              )}

              {/* Website */}
              {store.website && (
                <div>
                  <div className="font-medium text-gray-600">Website</div>
                  <a
                    href={store.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {store.website}
                  </a>
                </div>
              )}
              {/* Accepted Currencies */}
{store.acceptedCurrencies && Array.isArray(store.acceptedCurrencies) && store.acceptedCurrencies.length > 0 && (
  <div>
    <div className="font-medium text-gray-600">Accepted Currencies</div>
    <div className="text-gray-900">
      {store.acceptedCurrencies.join(', ')}
    </div>
  </div>
)}
            </div>
          </div>

          {/* OPENING HOURS */}
          {store.openingHours && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Opening Hours</h3>
              <div className="text-sm text-gray-700 space-y-2">
                {Object.entries(store.openingHours).map(([day, value]) => {
                  const dayNames = [
                    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
                    'Thursday', 'Friday', 'Saturday'
                  ];
                  const label = Number.isInteger(Number(day)) 
                    ? dayNames[Number(day)] 
                    : day;
                  
                  return (
                    <div key={day} className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{label}</span>
                      <span className="text-gray-900">
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
            </div>
          )}
        </div>
      </div>

      {/* BOOKING FORM MODAL */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Book a Visit</h3>
              <button
                                onClick={() => {
                  setShowBookingForm(false);
                  setSelectedDiscountId('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={bookingData.date}
                  onChange={handleBookingChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={bookingData.time}
                  onChange={handleBookingChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Visitors *
                </label>
                <select
                  name="numberOfVisitors"
                  value={bookingData.numberOfVisitors}
                  onChange={handleBookingChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingBooking}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingBooking ? 'Submitting...' : 'Submit Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VISIT SUBMITTED MESSAGE */}
      {visitSubmitted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
            <div className="text-green-600 text-4xl mb-4">✓</div>
            <h3 className="text-xl font-semibold mb-2">Visit Submitted</h3>
            <p className="text-gray-600 mb-4">
              Your visit has been scheduled successfully. You are being redirected to your visit details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}