//src/app/dashboard/store/discounts/list/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye, Calendar, Tag, Filter } from "lucide-react";

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
  code: string | null;
  type: string;
  minPurchase: number | null;
  maxDiscount: number | null;
  svdOnly: boolean;
  currentUses: number;
  maxUses: number | null;
  store: {
    name: string;
  };
};

export default function DiscountsListPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/auth/store/signin");
      return;
    }

    if (authStatus === "authenticated" && (session?.user as any)?.role !== "STORE_MANAGER") {
      router.replace("/");
      return;
    }

    if (authStatus === "authenticated") {
      loadDiscounts();
    }
  }, [authStatus, session, router]);

  async function loadDiscounts() {
    setError(null);
    try {
      const res = await fetch("/api/store/discounts");
      if (res.ok) {
        const data = await res.json();
        setDiscounts(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Failed to load discounts");
      }
    } catch (error) {
      console.error("Failed to load discounts", error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function updateDiscountStatus(discountId: string, status: string) {
    setUpdating(discountId);
    setError(null);
    try {
      const res = await fetch(`/api/store/discounts/${discountId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        await loadDiscounts(); // Refresh the list
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Failed to update discount status");
      }
    } catch (error) {
      console.error("Failed to update discount", error);
      setError("Network error. Please try again.");
    } finally {
      setUpdating(null);
    }
  }

  async function deleteDiscount(discountId: string) {
    if (!confirm("Are you sure you want to delete this discount? This action cannot be undone.")) return;
    
    setUpdating(discountId);
    setError(null);
    try {
      const res = await fetch(`/api/store/discounts/${discountId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadDiscounts(); // Refresh the list
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Failed to delete discount");
      }
    } catch (error) {
      console.error("Failed to delete discount", error);
      setError("Network error. Please try again.");
    } finally {
      setUpdating(null);
    }
  }

  function handleEdit(discountId: string) {
    router.push(`/dashboard/store/discounts/edit/${discountId}`);
  }

  function handleView(discountId: string) {
    router.push(`/dashboard/store/discounts/${discountId}`);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "POSTED": return "bg-green-100 text-green-800 border-green-200";
      case "DRAFT": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DISMOUNTED": return "bg-gray-100 text-gray-800 border-gray-200";
      case "DELETED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "POSTED": return "🟢";
      case "DRAFT": return "🟡";
      case "DISMOUNTED": return "⚫";
      case "DELETED": return "🔴";
      default: return "⚪";
    }
  }

  function getDiscountValue(discount: Discount) {
    if (discount.discountPercent) {
      return `${discount.discountPercent}%`;
    }
    if (discount.discountAmount) {
      return `€${discount.discountAmount}`;
    }
    return "Special Offer";
  }

  function getDiscountTypeLabel(discount: Discount) {
    if (discount.discountPercent) return "% OFF";
    if (discount.discountAmount) return "€ OFF";
    return "OFF";
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const filteredDiscounts = discounts.filter(discount => {
    if (filterStatus === "ALL") return discount.status !== "DELETED";
    return discount.status === filterStatus;
  });

  const activeDiscounts = discounts.filter(d => 
    d.status === "POSTED" && 
    new Date(d.validFrom) <= new Date() && 
    new Date(d.validTo) >= new Date()
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading discounts...</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadDiscounts}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Try again
          </button>
        </div>
        <button
          onClick={() => router.push("/dashboard/store/discounts")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Create New Discount
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Discounts</h1>
          <p className="text-gray-600 mt-2">
            {activeDiscounts.length} active • {discounts.filter(d => d.status !== "DELETED").length} total discounts
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/store/discounts")}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Tag className="w-4 h-4" />
          + Create New Discount
        </button>
      </div>

      {/* Status Filter */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Filter by status:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === "ALL" ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All ({discounts.filter(d => d.status !== "DELETED").length})
          </button>
          <button
            onClick={() => setFilterStatus("POSTED")}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${filterStatus === "POSTED" ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <span>🟢</span>
            Posted ({discounts.filter(d => d.status === "POSTED").length})
          </button>
          <button
            onClick={() => setFilterStatus("DRAFT")}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${filterStatus === "DRAFT" ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <span>🟡</span>
            Drafts ({discounts.filter(d => d.status === "DRAFT").length})
          </button>
          <button
            onClick={() => setFilterStatus("DISMOUNTED")}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${filterStatus === "DISMOUNTED" ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <span>⚫</span>
            Dismounted ({discounts.filter(d => d.status === "DISMOUNTED").length})
          </button>
        </div>
      </div>

      {filteredDiscounts.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
          <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No discounts found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {filterStatus === "ALL" 
              ? "You haven't created any discounts yet. Create your first discount to attract more customers!"
              : `No discounts with status "${filterStatus}" found. Try changing the filter or create a new discount.`}
          </p>
          <button
            onClick={() => router.push("/dashboard/store/discounts")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
            Create Your First Discount
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredDiscounts.map((discount) => (
            <div key={discount.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(discount.status)}`}>
                      {getStatusIcon(discount.status)} {discount.status}
                    </span>
                    {discount.svdOnly && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        🎯 Scheduled Visit Only
                      </span>
                    )}
                    {discount.code && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 font-mono">
                        Code: {discount.code}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{discount.title}</h3>
                      <p className="text-gray-600 mb-4 max-w-2xl">{discount.description}</p>
                      
                      <div className="flex flex-wrap gap-6 text-sm text-gray-700 mb-4">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {getDiscountValue(discount)} {getDiscountTypeLabel(discount)}
                            {discount.minPurchase && ` • Min: €${discount.minPurchase}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {formatDate(discount.validFrom)} → {formatDate(discount.validTo)}
                          </span>
                        </div>
                        {discount.maxUses && (
                          <div className="text-gray-600">
                            Uses: {discount.currentUses || 0}/{discount.maxUses}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(discount.id)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(discount.id)}
                        disabled={discount.status === "DELETED" || updating === discount.id}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit discount"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteDiscount(discount.id)}
                        disabled={updating === discount.id || discount.status === "DELETED"}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete discount"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => updateDiscountStatus(discount.id, "DRAFT")}
                      disabled={updating === discount.id || discount.status === "DRAFT" || discount.status === "DELETED"}
                      className="px-4 py-2 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-lg hover:bg-yellow-100 border border-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating === discount.id ? "Saving..." : "Save as Draft"}
                    </button>
                    
                    <button
                      onClick={() => updateDiscountStatus(discount.id, "POSTED")}
                      disabled={updating === discount.id || discount.status === "POSTED" || discount.status === "DELETED"}
                      className="px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating === discount.id ? "Posting..." : "Post to Store"}
                    </button>
                    
                    <button
                      onClick={() => updateDiscountStatus(discount.id, "DISMOUNTED")}
                      disabled={updating === discount.id || discount.status === "DISMOUNTED" || discount.status === "DELETED"}
                      className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating === discount.id ? "Dismounting..." : "Dismount"}
                    </button>
                    
                    {discount.status === "DELETED" && (
                      <span className="px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200">
                        Deleted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}