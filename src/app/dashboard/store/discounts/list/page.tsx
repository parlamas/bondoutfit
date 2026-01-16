//src/app/dashboard/store/discounts/list/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye, Calendar, Tag, Filter } from "lucide-react";
import { TrendingUp, TrendingDown, DollarSign, Users, Clock } from 'lucide-react';

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

    // Calculate analytics data
  function calculateAnalytics() {
    const now = new Date();
    const activeDiscounts = discounts.filter(d => 
      d.status === "POSTED" && 
      new Date(d.validFrom) <= now && 
      new Date(d.validTo) >= now
    );

    const expiringSoon = discounts.filter(d => {
      if (d.status !== "POSTED") return false;
      const validTo = new Date(d.validTo);
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return validTo >= now && validTo <= sevenDaysFromNow;
    });

    const totalUses = discounts.reduce((sum, d) => sum + (d.currentUses || 0), 0);
    const avgUsesPerDiscount = discounts.length > 0 ? totalUses / discounts.length : 0;

    // Calculate estimated revenue impact
    const estimatedRevenue = discounts.reduce((sum, d) => {
      let discountValue = 0;
      if (d.discountPercent) {
        // Assume average order value of €50
        discountValue = (d.discountPercent / 100) * 50 * (d.currentUses || 0);
      } else if (d.discountAmount) {
        discountValue = d.discountAmount * (d.currentUses || 0);
      }
      return sum + discountValue;
    }, 0);

    return {
      activeCount: activeDiscounts.length,
      expiringSoonCount: expiringSoon.length,
      totalUses,
      avgUsesPerDiscount: Math.round(avgUsesPerDiscount * 10) / 10,
      estimatedRevenue: Math.round(estimatedRevenue),
      redemptionRate: discounts.length > 0 ? 
        (discounts.filter(d => (d.currentUses || 0) > 0).length / discounts.length * 100).toFixed(1) : 
        "0.0"
    };
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
          <div className="flex items-start">
            <div className="ml-3">
              <p className="text-red-800 inline">{error}</p>
              <button
                onClick={loadDiscounts}
                className="ml-3 text-red-600 hover:text-red-800 text-sm font-medium inline"
              >
                Try again
              </button>
            </div>
          </div>
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
          <h1 className="text-3xl font-bold text-gray-900 inline">Manage Discounts</h1>
          <p className="text-gray-600 ml-4 inline">
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

            {/* Analytics Dashboard */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Discounts</p>
              <p className="text-2xl font-bold text-gray-900">{calculateAnalytics().activeCount}</p>
              <p className="text-xs text-gray-500 mt-1">Currently running</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Redemptions</p>
              <p className="text-2xl font-bold text-gray-900">{calculateAnalytics().totalUses}</p>
              <p className="text-xs text-gray-500 mt-1">
                {calculateAnalytics().avgUsesPerDiscount} avg per discount
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">{calculateAnalytics().expiringSoonCount}</p>
              <p className="text-xs text-gray-500 mt-1">Within 7 days</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Redemption Rate</p>
              <p className="text-2xl font-bold text-gray-900">{calculateAnalytics().redemptionRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Of discounts used</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700 inline">Filter by status:</span>
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
          <h3 className="text-xl font-semibold text-gray-700 mb-2 inline">No discounts found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto inline">
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
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 font-mono inline">
                        Code: {discount.code}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-2 inline">{discount.title}</h3>
                      <p className="text-gray-600 mb-4 max-w-2xl inline">{discount.description}</p>
                      
                      <div className="flex flex-wrap gap-6 text-sm text-gray-700 mb-4">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="font-medium inline">
                            {getDiscountValue(discount)} {getDiscountTypeLabel(discount)}
                            {discount.minPurchase && ` • Min: €${discount.minPurchase}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="inline">
                            {formatDate(discount.validFrom)} → {formatDate(discount.validTo)}
                          </span>
                        </div>
                        {discount.maxUses && (
                          <div className="text-gray-600 inline">
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
            {/* Expiring Discounts Alert */}
      {calculateAnalytics().expiringSoonCount > 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800 inline">
              {calculateAnalytics().expiringSoonCount} Discount{calculateAnalytics().expiringSoonCount === 1 ? '' : 's'} Expiring Soon
            </h3>
          </div>
          <p className="text-yellow-700 text-sm mb-4 inline">
            These discounts will expire in the next 7 days. Consider extending them or creating new ones.
          </p>
          <div className="grid gap-3">
            {discounts
              .filter(d => {
                if (d.status !== "POSTED") return false;
                const validTo = new Date(d.validTo);
                const sevenDaysFromNow = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
                return validTo >= new Date() && validTo <= sevenDaysFromNow;
              })
              .map(discount => (
                <div key={discount.id} className="flex items-center justify-between bg-white border border-yellow-100 rounded-lg p-3">
                  <div>
                    <p className="font-medium text-gray-900 inline">{discount.title}</p>
                    <p className="text-sm text-gray-600 inline">
                      Expires: {formatDate(discount.validTo)} • Code: {discount.code || 'No code'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(discount.id)}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    Extend
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}