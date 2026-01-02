// src/app/dashboard/store/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type StoreImage = {
  id: string;
  imageUrl: string;
  type: "LOGO" | "FRONT" | "GALLERY";
  order?: number;
};

export default function StoreDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [images, setImages] = useState<StoreImage[]>([]);
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"LOGO" | "FRONT" | "GALLERY">("GALLERY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    console.log("Auth status:", status);
    console.log("Session:", session);
    
    if (status === "unauthenticated") {
      console.log("Not authenticated, redirecting to signin");
      router.replace("/auth/signin");
      return;
    }
    
    if (status === "authenticated") {
      const userRole = (session?.user as any)?.role;
      console.log("User role:", userRole);
      
      if (userRole !== "STORE_MANAGER") {
        console.log("Not a store manager, redirecting to home");
        router.replace("/");
      }
    }
  }, [status, session, router]);

  // Fetch images only when authenticated as store manager
  useEffect(() => {
    if (status !== "authenticated") return;
    if ((session?.user as any)?.role !== "STORE_MANAGER") return;
    
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching images from API...");
        const response = await fetch("/api/store/images");
        
        console.log("Response status:", response.status);
        
        if (response.status === 401) {
          throw new Error("Not authenticated. Please sign in again.");
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API Response data:", data);
        
        // Handle response
        let finalImages: StoreImage[] = [];
        
        if (Array.isArray(data)) {
          finalImages = data;
        } else if (data && typeof data === "object") {
          if (Array.isArray(data.images)) {
            finalImages = data.images;
          } else if (data.id && data.imageUrl) {
            finalImages = [data];
          }
        }
        
        console.log("Final images array:", finalImages);
        setImages(finalImages);
        
      } catch (error) {
        console.error("Error fetching images:", error);
        setError(error instanceof Error ? error.message : "Failed to load images");
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [status, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError("Please enter an image URL");
      return;
    }

    try {
      const res = await fetch("/api/store/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, type }),
      });

      if (res.status === 401) {
        throw new Error("Not authenticated. Please sign in again.");
      }
      
      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const newImage = await res.json();
      
      setImages(prev => {
        const current = Array.isArray(prev) ? prev : [];
        return [newImage, ...current];
      });
      
      setUrl("");
      setError(null);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Failed to upload image");
    }
  };

  // Safe array for rendering
  const safeImages = Array.isArray(images) ? images : [];

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && (session?.user as any)?.role !== "STORE_MANAGER") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-xl font-bold text-yellow-800">Access Denied</h2>
          <p className="mt-2 text-yellow-700">
            This page is only for store managers.
          </p>
          <p className="mt-1 text-sm text-yellow-600">
            Your role: {(session?.user as any)?.role}
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Store Dashboard</h1>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Debug info - remove in production */}
      <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
        <p>User: {session?.user?.name}</p>
        <p>Role: {(session?.user as any)?.role}</p>
        <p>Status: {status}</p>
      </div>

      {/* UPLOAD FORM */}
      <form onSubmit={handleSubmit} className="border p-4 rounded space-y-3">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Image URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
        />

        <select
          className="w-full border px-3 py-2 rounded"
          value={type}
          onChange={e => setType(e.target.value as "LOGO" | "FRONT" | "GALLERY")}
        >
          <option value="LOGO">Logo</option>
          <option value="FRONT">Storefront</option>
          <option value="GALLERY">Gallery</option>
        </select>

        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add image
        </button>
      </form>

      {/* IMAGES LIST */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading images...</p>
        </div>
      ) : safeImages.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
          <p className="text-gray-500">No images found</p>
          <p className="text-sm text-gray-400 mt-1">Add your first image using the form above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {safeImages.map((img: StoreImage) => (
            <div key={img.id} className="border rounded p-2">
              <img
                src={img.imageUrl}
                className="h-32 w-full object-cover rounded"
                alt={`Store ${img.type?.toLowerCase() || "image"}`}
              />
              <div className="text-xs text-gray-600 mt-1">
                {img.type || "UNKNOWN"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
