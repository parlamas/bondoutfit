//src/app/dashboard/store/profile/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Upload, Camera, X, Edit, Trash2, Save,
  Building2, Image as ImageIcon, Globe, MapPin,
  Phone, Mail, User, ArrowLeft, Clock
} from 'lucide-react';

interface StoreProfile {
  id: string;
  name: string;
  email: string;
  description?: string;
  phoneCountry?: string;
  phoneArea?: string;
  phoneNumber: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  street: string;
  streetNumber: string;
  floor?: string;
  categories: string[];
  acceptedCurrencies: string[];
  logoUrl?: string;
  storefrontUrl?: string;
  galleryImages: GalleryImage[];
  website?: string;
  openingHours?: OpeningHours[];
}

interface GalleryImage {
  id: string;
  url: string;
  description: string;
  type: 'gallery' | 'logo' | 'storefront';
  order: number;
}

interface OpeningHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

export default function StoreProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [storeProfile, setStoreProfile] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'images' | 'hours'>('info');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const storefrontInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/store/signin');
    } else if (status === 'authenticated') {
      fetchStoreProfile();
    }
  }, [status, router]);

    const fetchStoreProfile = async () => {
    try {
      const response = await fetch('/api/store/profile');
      if (response.ok) {
        const data = await response.json();
        // Ensure galleryImages is always an array
        setStoreProfile({
          ...data,
          galleryImages: data.galleryImages || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch store profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (
    file: File,
    type: 'logo' | 'storefront' | 'gallery',
    description?: string
  ) => {
    const fileName = `${type}_${Date.now()}_${file.name}`;
    
    // Add to upload progress
    setUploadProgress(prev => [...prev, {
      fileName,
      progress: 0,
      status: 'uploading'
    }]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (description) {
      formData.append('description', description);
    }

    try {
      const response = await fetch('/api/upload/store-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // Update upload progress
        setUploadProgress(prev => 
          prev.map(u => u.fileName === fileName 
            ? { ...u, progress: 100, status: 'success' }
            : u
          )
        );

        // Update store profile with new image
        if (storeProfile) {
          if (type === 'logo') {
            setStoreProfile({ ...storeProfile, logoUrl: result.url });
          } else if (type === 'storefront') {
            setStoreProfile({ ...storeProfile, storefrontUrl: result.url });
          } else {
            const newGalleryImage: GalleryImage = {
              id: result.id,
              url: result.url,
              description: description || '',
              type: 'gallery',
              order: storeProfile?.galleryImages?.length || 0
            };
            setStoreProfile({
              ...storeProfile,
                        galleryImages: [...(storeProfile.galleryImages || []), newGalleryImage]
            });
          }
        }

        // Remove from progress after 3 seconds
        setTimeout(() => {
          setUploadProgress(prev => prev.filter(u => u.fileName !== fileName));
        }, 3000);
      } else {
        setUploadProgress(prev => 
          prev.map(u => u.fileName === fileName 
            ? { ...u, status: 'error' }
            : u
          )
        );
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(prev => 
        prev.map(u => u.fileName === fileName 
          ? { ...u, status: 'error' }
          : u
        )
      );
    }
  };

  const handleLogoUpload = () => {
    logoInputRef.current?.click();
  };

  const handleStorefrontUpload = () => {
    storefrontInputRef.current?.click();
  };

  const handleGalleryUpload = () => {
    galleryInputRef.current?.click();
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'storefront' | 'gallery'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
  setInlineMessage({ type: 'error', text: 'Invalid file type.' });
  return;
}


    if (file.size > 5 * 1024 * 1024) {
  setInlineMessage({ type: 'error', text: 'File too large.' });
  return;
}


    if (type === 'gallery') {
      const description = '';
      handleImageUpload(file, type, description || '');
    } else {
      handleImageUpload(file, type);
    }

    // Reset input
    e.target.value = '';
  };

  const updateImageDescription = async (imageId: string, description: string) => {
    if (!storeProfile) return;

    try {
      const response = await fetch(`/api/store/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (response.ok) {
        setStoreProfile({
          ...storeProfile,
          galleryImages: storeProfile.galleryImages.map(img =>
            img.id === imageId ? { ...img, description } : img
          )
        });
        setEditingImageId(null);
      }
    } catch (error) {
      console.error('Failed to update image description:', error);
    }
  };

  const deleteImage = async (imageId: string, type: 'logo' | 'storefront' | 'gallery') => {
    if (!storeProfile) return;

    try {
      const response = await fetch(`/api/store/images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
  if (type === 'logo') {
    setStoreProfile({ ...storeProfile, logoUrl: undefined });
  } else if (type === 'storefront') {
    setStoreProfile({ ...storeProfile, storefrontUrl: undefined });
  } else {
    setStoreProfile({
      ...storeProfile,
      galleryImages: storeProfile.galleryImages.filter(img => img.id !== imageId)
    });
  }

  setInlineMessage({ type: 'success', text: 'Image removed.' });
}

    } catch (error) {
  setInlineMessage({ type: 'error', text: 'Failed to remove image.' });
}
  };

  const reorderGalleryImage = async (imageId: string, newOrder: number) => {
    if (!storeProfile) return;

    const updatedGallery = [...storeProfile.galleryImages];
    const currentIndex = updatedGallery.findIndex(img => img.id === imageId);
    
    if (currentIndex === -1) return;

    const [movedImage] = updatedGallery.splice(currentIndex, 1);
    updatedGallery.splice(newOrder, 0, movedImage);
    
    // Update orders
    const reorderedGallery = updatedGallery.map((img, index) => ({
      ...img,
      order: index
    }));

    setStoreProfile({
      ...storeProfile,
      galleryImages: reorderedGallery
    });

    // Save to backend
    try {
      await fetch('/api/store/images/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: reorderedGallery }),
      });
    } catch (error) {
      console.error('Failed to reorder images:', error);
    }
  };

  const saveProfile = async () => {
    if (!storeProfile) return;

    setSaving(true);
    try {
      const response = await fetch('/api/store/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeProfile.name,
          description: storeProfile.description,
          website: storeProfile.website,
          phoneCountry: storeProfile.phoneCountry,
          phoneArea: storeProfile.phoneArea,
          phoneNumber: storeProfile.phoneNumber,
          categories: storeProfile.categories,
        }),
      });

            if (response.ok) {
        setSaveSuccess(true);
        setInlineMessage({ type: 'success', text: 'Saved.' });
        setTimeout(() => setSaveSuccess(false), 3000); // Hide after 3 seconds
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      setInlineMessage({ type: 'error', text: 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
      }

    const handleOpeningHoursChange = (index: number, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    if (!storeProfile) return;
    
    // Get the default hours array if openingHours doesn't exist
    const currentHours = storeProfile.openingHours || [
      { day: 'Monday', open: '09:00', close: '18:00', closed: false },
      { day: 'Tuesday', open: '09:00', close: '18:00', closed: false },
      { day: 'Wednesday', open: '09:00', close: '18:00', closed: false },
      { day: 'Thursday', open: '09:00', close: '18:00', closed: false },
      { day: 'Friday', open: '09:00', close: '18:00', closed: false },
      { day: 'Saturday', open: '10:00', close: '16:00', closed: false },
      { day: 'Sunday', open: '', close: '', closed: true },
    ];
    
    // Create a copy of the array
    const updatedHours = [...currentHours];
    
    // Make sure we're updating the correct index
    if (index >= 0 && index < updatedHours.length) {
      updatedHours[index] = {
        ...updatedHours[index],
        [field]: value
      };
    }
    
    setStoreProfile({
      ...storeProfile,
      openingHours: updatedHours
    });
  };

  const saveOpeningHours = async () => {
    if (!storeProfile) return;

    setSaving(true);
    try {
      const response = await fetch('/api/store/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openingHours: storeProfile.openingHours
        }),
      });

            if (response.ok) {
        setSaveSuccess(true);
        setInlineMessage({ type: 'success', text: 'Saved.' });
        setTimeout(() => setSaveSuccess(false), 3000); // Hide after 3 seconds
      }
    } catch (error) {
      console.error('Failed to save opening hours:', error);
      setInlineMessage({ type: 'error', text: 'Failed to save opening hours.' });
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session || !storeProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/store')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Store Profile</h1>
                <p className="text-gray-600 mt-1">Manage your store information and images</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-600 animate-fade-in">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Changes saved!</span>
                </div>
              )}
              
              <button
                onClick={saveProfile}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'info' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <User className="inline-block h-4 w-4 mr-2" />
              Store Info
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'images' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <ImageIcon className="inline-block h-4 w-4 mr-2" />
              Images & Gallery
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'hours' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Clock className="inline-block h-4 w-4 mr-2" />
              Opening Hours
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {inlineMessage && (
  <div
    className={`mb-4 rounded-lg px-4 py-3 text-sm ${
      inlineMessage.type === 'success'
        ? 'bg-green-50 text-green-700 border border-green-200'
        : 'bg-red-50 text-red-700 border border-red-200'
    }`}
  >
    {inlineMessage.text}
  </div>
)}

        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  Basic Information
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      value={storeProfile.name}
                      onChange={(e) => setStoreProfile({ ...storeProfile, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={storeProfile.description || ''}
                      onChange={(e) => setStoreProfile({ ...storeProfile, description: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe your store..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        value={storeProfile.website || ''}
                        onChange={(e) => setStoreProfile({ ...storeProfile, website: e.target.value })}
                        placeholder="https://example.com"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={storeProfile.phoneCountry || ''}
                          onChange={(e) => setStoreProfile({ ...storeProfile, phoneCountry: e.target.value })}
                          placeholder="Country"
                          className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={storeProfile.phoneArea || ''}
                          onChange={(e) => setStoreProfile({ ...storeProfile, phoneArea: e.target.value })}
                          placeholder="Area"
                          className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={storeProfile.phoneNumber}
                          onChange={(e) => setStoreProfile({ ...storeProfile, phoneNumber: e.target.value })}
                          placeholder="Number"
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={storeProfile.email}
                          disabled
                          className="flex-1 border border-gray-300 bg-gray-50 rounded-lg px-4 py-2 text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {storeProfile.categories?.map((category, index) => (
                        <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                          {category}
                          <button
                            onClick={() => {
                              const newCategories = storeProfile.categories.filter((_, i) => i !== index);
                              setStoreProfile({ ...storeProfile, categories: newCategories });
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        placeholder="Add a category"
                        className="border border-gray-300 rounded-full px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            const newCategory = e.currentTarget.value.trim();
                            if (!storeProfile.categories.includes(newCategory)) {
                              setStoreProfile({
                                ...storeProfile,
                                categories: [...storeProfile.categories, newCategory]
                              });
                            }
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Address */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="h-6 w-6" />
                  Address
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={storeProfile.street}
                        onChange={(e) => setStoreProfile({ ...storeProfile, street: e.target.value })}
                        placeholder="Street"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={storeProfile.streetNumber}
                        onChange={(e) => setStoreProfile({ ...storeProfile, streetNumber: e.target.value })}
                        placeholder="No."
                        className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floor / Unit (Optional)
                    </label>
                    <input
                      type="text"
                      value={storeProfile.floor || ''}
                      onChange={(e) => setStoreProfile({ ...storeProfile, floor: e.target.value })}
                      placeholder="e.g., 3rd Floor, Unit 5"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={storeProfile.city}
                        onChange={(e) => setStoreProfile({ ...storeProfile, city: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={storeProfile.state}
                        onChange={(e) => setStoreProfile({ ...storeProfile, state: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP / Postal Code
                      </label>
                      <input
                        type="text"
                        value={storeProfile.zip}
                        onChange={(e) => setStoreProfile({ ...storeProfile, zip: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={storeProfile.country}
                        onChange={(e) => setStoreProfile({ ...storeProfile, country: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-8">
            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Upload Progress</h3>
                <div className="space-y-2">
                  {uploadProgress.map((upload) => (
                    <div key={upload.fileName} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{upload.fileName}</span>
                      <div className="flex items-center gap-2">
                        {upload.status === 'uploading' && (
                          <>
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${upload.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{upload.progress}%</span>
                          </>
                        )}
                        {upload.status === 'success' && (
                          <span className="text-green-600 text-sm">✓ Uploaded</span>
                        )}
                        {upload.status === 'error' && (
                          <span className="text-red-600 text-sm">✗ Failed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logo Upload */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Store Logo</h2>
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={(e) => handleFileChange(e, 'logo')}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={handleLogoUpload}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {storeProfile.logoUrl ? 'Change Logo' : 'Upload Logo'}
                </button>
              </div>

              <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl">
                {storeProfile.logoUrl ? (
                  <div className="relative group">
                    <div className="relative w-48 h-48 overflow-hidden rounded-lg">
                                        <Image
                    src={storeProfile.logoUrl}
  alt="Store Logo"
  fill
  className="object-contain"
  sizes="(max-width: 768px) 100vw, 192px"
/>
                    </div>
                    <button
                      onClick={() => deleteImage('logo', 'logo')}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No logo uploaded yet</p>
                    <p className="text-gray-500 text-sm mt-1">Recommended: Square image, transparent background</p>
                  </div>
                )}
              </div>
            </div>

            {/* Storefront Image */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Storefront Image</h2>
                <input
                  type="file"
                  ref={storefrontInputRef}
                  onChange={(e) => handleFileChange(e, 'storefront')}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={handleStorefrontUpload}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {storeProfile.storefrontUrl ? 'Change Image' : 'Upload Storefront'}
                </button>
              </div>

              <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl">
                {storeProfile.storefrontUrl ? (
                  <div className="relative group w-full max-w-2xl">
                    <div className="relative w-full h-64 overflow-hidden rounded-lg">
                      <Image
                        src={storeProfile.storefrontUrl}
                        alt="Storefront"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => deleteImage('storefront', 'storefront')}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No storefront image uploaded yet</p>
                    <p className="text-gray-500 text-sm mt-1">Show your store exterior or entrance</p>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Images */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Gallery Images</h2>
                <input
                  type="file"
                  ref={galleryInputRef}
                  onChange={(e) => handleFileChange(e, 'gallery')}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={handleGalleryUpload}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Add to Gallery
                </button>
              </div>

              {storeProfile?.galleryImages?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {storeProfile.galleryImages.map((image, index) => (
                    <div key={image.id} className="relative group border rounded-xl overflow-hidden">
                      <div className="relative h-64">
                        <Image
                          src={image.url}
                          alt={image.description || 'Gallery image'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200" />
                        
                        {/* Controls */}
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => deleteImage(image.id, 'gallery')}
                            className="p-2 bg-red-600 text-white rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Move buttons */}
                        <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {index > 0 && (
                            <button
                              onClick={() => reorderGalleryImage(image.id, index - 1)}
                              className="p-2 bg-white text-gray-800 rounded-lg shadow"
                            >
                              ↑
                            </button>
                          )}
                          {index < storeProfile.galleryImages.length - 1 && (
                            <button
                              onClick={() => reorderGalleryImage(image.id, index + 1)}
                              className="p-2 bg-white text-gray-800 rounded-lg shadow"
                            >
                              ↓
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="p-4">
                        {editingImageId === image.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={imageDescription}
                              onChange={(e) => setImageDescription(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              rows={2}
                              placeholder="Describe this image..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateImageDescription(image.id, imageDescription)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingImageId(null);
                                  setImageDescription('');
                                }}
                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">{image.description || 'No description'}</p>
                              <p className="text-xs text-gray-500 mt-1">Position: {index + 1}</p>
                            </div>
                            <button
                              onClick={() => {
                                setEditingImageId(image.id);
                                setImageDescription(image.description);
                              }}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No gallery images yet</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Upload images of your products, interior, or services
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Opening Hours</h2>
            <div className="space-y-4 max-w-2xl">
              {(storeProfile.openingHours || [
                { day: 'Monday', open: '09:00', close: '18:00', closed: false },
                { day: 'Tuesday', open: '09:00', close: '18:00', closed: false },
                { day: 'Wednesday', open: '09:00', close: '18:00', closed: false },
                { day: 'Thursday', open: '09:00', close: '18:00', closed: false },
                { day: 'Friday', open: '09:00', close: '18:00', closed: false },
                { day: 'Saturday', open: '10:00', close: '16:00', closed: false },
                { day: 'Sunday', open: '', close: '', closed: true },
              ]).map((hours, index) => (
                <div key={hours.day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-800 w-24">{hours.day}</span>
                    {hours.closed ? (
                      <span className="text-red-600 font-medium">Closed</span>
                    ) : (
                      <div className="flex items-center gap-2">
                                                <input
  type="time"
  value={hours.open || ''}
  onChange={(e) => handleOpeningHoursChange(index, 'open', e.target.value)}
  className="border border-gray-300 rounded-lg px-3 py-1"
/>
<input
  type="time"
  value={hours.close || ''}
  onChange={(e) => handleOpeningHoursChange(index, 'close', e.target.value)}
  className="border border-gray-300 rounded-lg px-3 py-1"
/>
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-2">
                                        <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) => handleOpeningHoursChange(index, 'closed', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Closed</span>
                  </label>
                </div>
              ))}
              <div className="pt-4">
                                <button 
                  onClick={saveOpeningHours}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  Save Hours
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
