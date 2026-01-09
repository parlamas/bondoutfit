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
  const updateDescription = (
    imageId: string,
    description: string
  ) => {
    setCategories(prev =>
      prev.map(category => ({
        ...category,
        images: category.images.map(img =>
          img.id === imageId
            ? { ...img, description }
            : img
        ),
      }))
    );
  };



const deleteImage = async (imageId: string) => {
  await fetch(`/api/store/categories/images/${imageId}`, {
    method: 'DELETE',
  });

  setCategories(prev =>
    prev.map(category => ({
      ...category,
      images: category.images.filter(img => img.id !== imageId),
    }))
  );
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
};

const reorderCategory = async (from: number, to: number) => {
  console.log('Reordering category from', from, 'to', to);
  
  if (to < 0 || to >= categories.length) return;

  const newCategories = [...categories];
  const [moved] = newCategories.splice(from, 1);
  newCategories.splice(to, 0, moved);

  console.log('New order:', newCategories.map(c => c.title));
  
  setCategories(newCategories);

  try {
    const res = await fetch('/api/store/categories/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categories: newCategories.map((cat, i) => ({
          id: cat.id,
          order: i,
        })),
      }),
    });
    
    console.log('API response status:', res.status);
    
    if (!res.ok) {
      const error = await res.text();
      console.error('API Error:', error);
      loadCategories();
    } else {
      console.log('Reorder successful');
    }
  } catch (error) {
    console.error('Network Error:', error);
    loadCategories();
  }
};

  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [uploadDescriptions, setUploadDescriptions] = useState<Record<string, string>>({});

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
  const formData = new FormData();
  formData.append('file', file);
  formData.append('categoryId', categoryId);

  if (uploadDescriptions[categoryId]) {
    formData.append('description', uploadDescriptions[categoryId]);
  }

  const res = await fetch('/api/upload/store-image', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) return;

  const result = await res.json();

const image = {
  id: result.id,
  imageUrl: result.url,
  description: result.description ?? null,
  order: result.order ?? 0,
};

setCategories(prev =>
  prev.map(cat =>
    cat.id === categoryId
      ? { ...cat, images: [...cat.images, image] }
      : cat
  )
);


  setUploadDescriptions(prev => ({
    ...prev,
    [categoryId]: '',
  }));
};

  

const handleSave = async () => {
  await fetch('/api/store/categories/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categories }),
  });

  setSaved(true);
  setTimeout(() => setSaved(false), 2000);

  loadCategories();
};


  if (loading) return <p>Loading…</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Store Categories</h1>

<button
  onClick={handleSave}
  className="bg-green-600 text-white px-4 py-2 rounded"
>
  Save
</button>

{saved && (
  <span className="text-green-600 text-sm ml-3">
    Saved!
  </span>
)}


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
            {categories.map((category, index) => (
        <div key={category.id} className="border rounded p-4 space-y-4">
                <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{category.title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => reorderCategory(index, index - 1)}
              disabled={index === 0}
              className="disabled:opacity-30"
            >
              ↑
            </button>
            <button
              onClick={() => reorderCategory(index, index + 1)}
              disabled={index === categories.length - 1}
              className="disabled:opacity-30"
            >
              ↓
            </button>
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
        </div>

          <input
  type="text"
  value={uploadDescriptions[category.id] || ''}
  onChange={(e) =>
    setUploadDescriptions(prev => ({
      ...prev,
      [category.id]: e.target.value,
    }))
  }
  placeholder="Description for new image (optional)"
  className="w-full border rounded px-2 py-1 text-sm"
/>

<input
  type="file"
  accept="image/*"
  onChange={(e) => {
    if (e.target.files?.[0]) {
      uploadImage(e.target.files[0], category.id);
    }
  }}
/>


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
  unoptimized
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
