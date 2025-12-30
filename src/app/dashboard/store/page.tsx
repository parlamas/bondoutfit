// src/app/dashboard/store/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/* =====================
   TYPES
===================== */

type StoreItemImage = {
  id: string;
  imageUrl: string;
};

type StoreItem = {
  id: string;
  name: string;
  category: string;
  price: number | null;
  visible: boolean;
  images: StoreItemImage[];
};

/* =====================
   COMPONENT
===================== */

export default function StoreDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    category: "CLOTHING",
    price: "",
  });

  /* =====================
     ACCESS CONTROL
  ===================== */

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }

    if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "STORE_MANAGER"
    ) {
      router.replace("/");
    }
  }, [status, session, router]);

  /* =====================
     FETCH ITEMS
  ===================== */

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/store/items")
      .then(res => res.json())
      .then(data => setItems(data))
      .finally(() => setLoading(false));
  }, [status]);

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  /* =====================
     RENDER
  ===================== */

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Store Items</h1>

      {/* CREATE ITEM */}
      <form
        className="border rounded-lg p-4 bg-white space-y-3"
        onSubmit={async e => {
          e.preventDefault();

          const res = await fetch("/api/store/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              category: form.category,
              price: form.price ? Number(form.price) : null,
            }),
          });

          if (!res.ok) return;

          const created = await res.json();
          setItems(prev => [created, ...prev]);

          setForm({
            name: "",
            category: "CLOTHING",
            price: "",
          });
        }}
      >
        <input
          required
          placeholder="Item name"
          className="w-full border px-3 py-2 rounded"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <select
          className="w-full border px-3 py-2 rounded"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
        >
          <option value="CLOTHING">Clothing</option>
          <option value="FOOTWEAR">Footwear</option>
          <option value="ACCESSORIES">Accessories</option>
        </select>

        <input
          type="number"
          placeholder="Price in cents (optional)"
          className="w-full border px-3 py-2 rounded"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add item
        </button>
      </form>

      {/* ITEM LIST */}
      {items.length === 0 ? (
        <p className="text-gray-600">No items yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} className="border rounded-lg p-4 bg-white">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-600">{item.category}</div>

              {item.price !== null && (
                <div className="mt-1 text-sm font-medium">
                  € {(item.price / 100).toFixed(2)}
                </div>
              )}

              {/* IMAGES */}
              {item.images.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {item.images.map(img => (
                    <img
                      key={img.id}
                      src={img.imageUrl}
                      className="h-20 w-20 object-cover rounded"
                      alt=""
                    />
                  ))}
                </div>
              )}

              {/* ADD IMAGE */}
<form
  className="mt-3"
  onSubmit={async e => {
    e.preventDefault();

    const input = e.currentTarget.elements.namedItem(
      "file"
    ) as HTMLInputElement;

    if (!input.files?.[0]) return;

    const formData = new FormData();
    formData.append("file", input.files[0]);

    const uploadRes = await fetch(
      "/api/upload/store-item-image",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadRes.ok) return;

    const { url } = await uploadRes.json();

    const res = await fetch("/api/store/items/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeItemId: item.id,
        imageUrl: url,
      }),
    });

    if (!res.ok) return;

    const image = await res.json();

    setItems(prev =>
      prev.map(x =>
        x.id === item.id
          ? { ...x, images: [...(x.images || []), image] }
          : x
      )
    );

    input.value = "";
  }}
>
  <input
    type="file"
    name="file"
    accept="image/*"
    className="w-full text-sm"
  />
</form>


            </div>
          ))}
        </div>
      )}
    </div>
  );
}
