//src/app/dashboard/store/categories/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type CategoryImage = {
  id: string;
  imageUrl: string;
  description: string | null;
  order: number;
};

type StoreCategory = {
  id: string;
  title: string;
  images: CategoryImage[];
};

export default function StoreCategoriesPage() {
  const updateDescription = async (
  imageId: string,
  description: string
) => {
  await fetch(`/api/store/categories/images/${imageId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });

  loadCategories();
};

const deleteImage = async (imageId: string) => {
  await fetch(`/api/store/categories/images/${imageId}`, {
    method: 'DELETE',
  });

  loadCategories();
};

const reorderImages = async (
  categoryId: string,
  from: number,
  to: number
) => {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return;

  const images = [...category.images];
  const [moved] = images.splice(from, 1);
  images.splice(to, 0, moved);

  await fetch('/api/store/categories/images/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      images: images.map((img, i) => ({
        id: img.id,
        order: i,
      })),
    }),
  });

  loadCategories();
};

  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [localPreviews, setLocalPreviews] = useState<Record<string, string[]>>({});
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    const res = await fetch('/api/store/categories');
    if (res.ok) {
      setCategories(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const createCategory = async () => {
    if (!newTitle.trim()) return;

    await fetch('/api/store/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });

    setNewTitle('');
    loadCategories();
  };

  const uploadImage = async (file: File, categoryId: string) => {
  const previewUrl = URL.createObjectURL(file);

  setLocalPreviews(prev => ({
    ...prev,
    [categoryId]: [...(prev[categoryId] || []), previewUrl],
  }));

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'gallery');
  formData.append('categoryId', categoryId);

  await fetch('/api/upload/store-image', {
    method: 'POST',
    body: formData,
  });

  loadCategories();
};


  if (loading) return <p>Loading…</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Store Categories</h1>

      {/* CREATE CATEGORY */}
      <div className="flex gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New category title"
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          onClick={createCategory}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* CATEGORIES */}
      {categories.map((category) => (
        <div key={category.id} className="border rounded p-4 space-y-4">
        <div className="flex items-center justify-between">
  <h2 className="text-xl font-semibold">{category.title}</h2>
  <button
    onClick={async () => {
      await fetch(`/api/store/categories/${category.id}`, {
        method: 'DELETE',
      });
      loadCategories();
    }}
    className="text-red-600 text-sm underline"
  >
    Delete
  </button>
</div>


          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                uploadImage(e.target.files[0], category.id);
              }
            }}
          />

          {localPreviews[category.id]?.length > 0 && (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {localPreviews[category.id].map((src, i) => (
      <img
        key={i}
        src={src}
        className="rounded object-cover"
        alt=""
      />
    ))}
  </div>
)}


          {category.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {category.images.map((img, index) => (
                <div key={img.id} className="space-y-2">
  <Image
    src={img.imageUrl}
    alt={img.description || category.title}
    width={300}
    height={300}
    className="rounded object-cover"
  />

  <textarea
    value={img.description || ''}
    onChange={(e) =>
      updateDescription(img.id, e.target.value)
    }
    placeholder="Image description"
    className="w-full border rounded px-2 py-1 text-sm"
  />

  <div className="flex gap-2 text-xs">
    {index > 0 && (
      <button
        onClick={() =>
          reorderImages(category.id, index, index - 1)
        }
        className="underline"
      >
        ↑
      </button>
    )}

    {index < category.images.length - 1 && (
      <button
        onClick={() =>
          reorderImages(category.id, index, index + 1)
        }
        className="underline"
      >
        ↓
      </button>
    )}

    <button
      onClick={() => deleteImage(img.id)}
      className="text-red-600 underline"
    >
      Delete
    </button>
  </div>
</div>

              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
