//src/app/dashboard/store/collections/[collectionId]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Trash2,
  Save,
  X
} from 'lucide-react';

type Collection = {
  id: string;
  title: string;
  description?: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
  images: CollectionImage[];
};

type CollectionImage = {
  id: string;
  url: string;
  order: number;
  collectionId: string;
};

export default function CollectionDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const collectionId = params.collectionId as string;
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/store/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'STORE_MANAGER') {
      router.push('/dashboard/customer');
      return;
    }

    if (collectionId) {
      fetchCollection();
    }
  }, [status, session, collectionId, router]);

  async function fetchCollection() {
    try {
      const res = await fetch(`/api/store/collections/${collectionId}`);
      if (res.ok) {
        const data = await res.json();
        setCollection(data);
        setEditedName(data.title);
        setEditedDescription(data.description || '');
      } else if (res.status === 404) {
        setError('Collection not found');
      } else {
        setError('Failed to load collection');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDetails() {
    try {
      const res = await fetch(`/api/store/collections/${collectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedName,
          description: editedDescription
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setCollection(updated);
        setIsEditing(false);
      } else {
        alert('Failed to update collection');
      }
    } catch (error) {
      alert('Network error');
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    formData.append('collectionId', collectionId);

    try {
      const res = await fetch('/api/store/collections/images/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        fetchCollection(); // Refresh collection data
      } else {
        alert('Failed to upload images');
      }
    } catch (error) {
      alert('Network error');
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const res = await fetch(`/api/store/collections/images/${imageId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchCollection(); // Refresh collection data
      } else {
        alert('Failed to delete image');
      }
    } catch (error) {
      alert('Network error');
    }
  }

  async function handleReorderImages(imageId: string, direction: 'up' | 'down') {
    if (!collection) return;

    const currentIndex = collection.images.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= collection.images.length) return;

    const newOrder = [...collection.images];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];

    try {
      const res = await fetch('/api/store/collections/images/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId,
          images: newOrder.map((img, idx) => ({ id: img.id, order: idx }))
        })
      });

      if (res.ok) {
        setCollection({
          ...collection,
          images: newOrder
        });
      }
    } catch (error) {
      console.error('Failed to reorder:', error);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error || 'Collection not found'}</p>
          <button
            onClick={() => router.push('/dashboard/store/collections')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/store/collections')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Collections
          </button>

          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-3xl font-bold w-full px-3 py-2 border rounded-lg"
                    placeholder="Collection name"
                  />
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Collection description (optional)"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveDetails}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(collection.title);
                        setEditedDescription(collection.description || '');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{collection.title}</h1>
                  {collection.description && (
                    <p className="text-gray-600 mt-2">{collection.description}</p>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Images Section */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Collection Images</h2>
            
            {/* Image Upload */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Add Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploading && (
                <p className="text-sm text-gray-500 mt-2">Uploading...</p>
              )}
            </div>

            {/* Image Grid */}
            {collection.images.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No images yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Upload images to showcase your collection
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {collection.images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={`Collection image ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {index > 0 && (
                        <button
                          onClick={() => handleReorderImages(image.id, 'up')}
                          className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                        >
                          ↑
                        </button>
                      )}
                      {index < collection.images.length - 1 && (
                        <button
                          onClick={() => handleReorderImages(image.id, 'down')}
                          className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700"
                        >
                          ↓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
