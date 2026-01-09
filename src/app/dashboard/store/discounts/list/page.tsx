//src/app/dashboard/store/discounts/list/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Discount = {
  id: string;
  title: string;
  description: string;
  discountPercent: number | null;
  discountAmount: number | null;
  validFrom: string;
  validTo: string;
  status: "DRAFT" | "POSTED" | "DISMOUNTED" | "DELETED";
  createdAt: string;
  store: {
    name: string;
  };
};

export default function DiscountsListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/store/signin");
    }

    if (status === "authenticated" && (session?.user as any)?.role !== "STORE_MANAGER") {
      router.replace("/");
    }

    if (status === "authenticated") {
      loadDiscounts();
    }
  }, [status, session, router]);

  async function loadDiscounts() {
    try {
      const res = await fetch("/api/store/discounts");
      if (res.ok) {
        const data = await res.json();
        setDiscounts(data);
      }
    } catch (error) {
      console.error("Failed to load discounts", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateDiscountStatus(discountId: string, status: string) {
    setUpdating(discountId);
    try {
      const res = await fetch(`/api/store/discounts/${discountId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        loadDiscounts(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to update discount", error);
    } finally {
      setUpdating(null);
    }
  }

  async function deleteDiscount(discountId: string) {
    if (!confirm("Are you sure you want to delete this discount?")) return;
    
    setUpdating(discountId);
    try {
      const res = await fetch(`/api/store/discounts/${discountId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadDiscounts(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to delete discount", error);
    } finally {
      setUpdating(null);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "POSTED": return "bg-green-100 text-green-800";
      case "DRAFT": return "bg-yellow-100 text-yellow-800";
      case "DISMOUNTED": return "bg-gray-100 text-gray-800";
      case "DELETED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  if (loading) return <div className="p-6">Loading discounts...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manage Discounts</h1>
        <button
          onClick={() => router.push("/dashboard/store/discounts")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Create New Discount
        </button>
      </div>

      {discounts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-gray-500 mb-4">No discounts created yet</p>
          <button
            onClick={() => router.push("/dashboard/store/discounts")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Your First Discount
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {discounts.map((discount) => (
            <div key={discount.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{discount.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(discount.status)}`}>
                      {discount.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{discount.description}</p>
                  
                  <div className="flex gap-4 text-sm text-gray-700">
                    <span>Discount: {discount.discountPercent}%</span>
                    <span>Valid: {new Date(discount.validFrom).toLocaleDateString()} - {new Date(discount.validTo).toLocaleDateString()}</span>
                    <span>Created: {new Date(discount.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => updateDiscountStatus(discount.id, "DRAFT")}
                    disabled={updating === discount.id || discount.status === "DRAFT"}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded hover:bg-yellow-200 disabled:opacity-50"
                  >
                    {updating === discount.id ? "Saving..." : "Save"}
                  </button>
                  
                  <button
                    onClick={() => updateDiscountStatus(discount.id, "POSTED")}
                    disabled={updating === discount.id || discount.status === "POSTED"}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded hover:bg-green-200 disabled:opacity-50"
                  >
                    {updating === discount.id ? "Posting..." : "Post"}
                  </button>
                  
                  <button
                    onClick={() => updateDiscountStatus(discount.id, "DISMOUNTED")}
                    disabled={updating === discount.id || discount.status === "DISMOUNTED"}
                    className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    {updating === discount.id ? "Dismounting..." : "Dismount"}
                  </button>
                  
                  <button
                    onClick={() => deleteDiscount(discount.id)}
                    disabled={updating === discount.id}
                    className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    {updating === discount.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}