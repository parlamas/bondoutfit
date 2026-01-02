// src/app/dashboard/store/images/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type StoreImage = {
  id: string;
  imageUrl: string;
};

export default function StoreImagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [images, setImages] = useState<StoreImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  /* ─────────── Protect page ─────────── */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }

    if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "STORE_MANAGER"
    ) {
      router.replace("/");
    }
  }, [status, session, router]);

  /* ─────────── Fetch images ─────────── */
  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/store/images")
      .then(res => res.json())
      .then(setImages)
      .finally(() => setLoading(false));
  }, [status]);

  if (loading) {
    return <div className="p-6">Loading store images…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Store Images</h1>

      {/* UPLOAD */}
      <form
        onSubmit={async e => {
          e.preventDefault();
          setUploading(true);

          const fileInput = e.currentTarget.elements.namedItem(
            "file"
          ) as HTMLInputElement;

          if (!fileInput.files?.[0]) return;

          const formData = new FormData();
          formData.append("file", fileInput.files[0]);

          const uploadRes = await fetch("/api/upload/store-image", {
            method: "POST",
            body: formData,
          });

          const { url } = await uploadRes.json();

          const saveRes = await fetch("/api/store/images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: url }),
          });

          const created = await saveRes.json();
          setImages(prev => [created, ...prev]);

          fileInput.value = "";
          setUploading(false);
        }}
        className="border rounded-lg p-4 bg-white space-y-3"
      >
        <input
          type="file"
          name="file"
          accept="image/*"
          required
        />

        <button
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload image"}
        </button>
      </form>

      {/* GALLERY */}
      {images.length === 0 ? (
        <p className="text-gray-600">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map(img => (
            <img
              key={img.id}
              src={img.imageUrl}
              className="w-full h-40 object-cover rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
}
