//src/app/dashboard/store/discounts/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Percent, 
  Euro,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  ShoppingBag
} from "lucide-react";

type Discount = {
  id: string;
  title: string;
  description: string;
  discountPercent: number | null;
  discountAmount: number | null;
  validFrom: string;
  validTo: string;
  status: "DRAFT" | "POSTED" | "DISMOUNTED" | "DELETED";
  code: string | null;
  type: string;
  minPurchase: number | null;
  maxDiscount: number | null;
  svdOnly: boolean;
  applicableCategories: string[];
  excludedItems: string[];
  maxUses: number | null;
  maxUsesPerUser: number | null;
  isSingleUse: boolean;
  isStackable: boolean;
  isActive: boolean;
  currentUses: number;
  createdAt: string;
  updatedAt: string;
};

export default function DiscountDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const discountId = params.id as string;
  
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/store/signin");
    }

    if (status === "authenticated" && (session?.user as any)?.role !== "STORE_MANAGER") {
      router.replace("/");
    }

    if (status === "authenticated" && discountId) {
      loadDiscount();
    }
  }, [status, session, router, discountId]);

  async function loadDiscount() {
    try {
      const res = await fetch(`/api/store/discounts/${discountId}`);
      if (res.ok) {
        const data = await res.json();
        setDiscount(data);
      } else {
        console.error("Failed to load discount");
        router.back();
      }
    } catch (error) {
      console.error("Failed to load discount", error);
      router.back();
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const statusConfig = {
      "POSTED": { color: "bg-green-100 text-green-800 border-green-200", icon: "🟢" },
      "DRAFT": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🟡" },
      "DISMOUNTED": { color: "bg-gray-100 text-gray-800 border-gray-200", icon: "⚫" },
      "DELETED": { color: "bg-red-100 text-red-800 border-red-200", icon: "🔴" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        {config.icon} {status}
      </span>
    );
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading discount details...</p>
      </div>
    </div>
  );

  if (!discount) return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Discount not found</h2>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800"
        >
          Go back
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discounts
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{discount.title}</h1>
            <div className="flex items-center gap-3 mt-3">
              {getStatusBadge(discount.status)}
              {discount.svdOnly && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  🎯 Scheduled Visit Only
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => router.push(`/dashboard/store/discounts/edit/${discountId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Discount
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {discount.description || "No description provided"}
            </p>
          </div>

          {/* Discount Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Discount Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm font-medium">Type</span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {discount.type === "PERCENTAGE" ? "Percentage Discount" :
                     discount.type === "AMOUNT" ? "Amount Discount" :
                     "Free Shipping"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    {discount.type === "PERCENTAGE" ? (
                      <Percent className="w-4 h-4" />
                    ) : (
                      <Euro className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">Value</span>
                  </div>
                  <p className="text-gray-900 font-medium text-2xl">
                    {discount.type === "PERCENTAGE" ? `${discount.discountPercent}% OFF` :
                     discount.type === "AMOUNT" ? `€${discount.discountAmount} OFF` :
                     "FREE SHIPPING"}
                  </p>
                </div>

                {discount.code && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm font-medium">Discount Code</span>
                    </div>
                    <p className="font-mono bg-gray-100 px-3 py-2 rounded-lg text-gray-900">
                      {discount.code}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Validity Period</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-900">
                      <span className="font-medium">From:</span> {formatDate(discount.validFrom)}
                    </p>
                    <p className="text-gray-900">
                      <span className="font-medium">To:</span> {formatDate(discount.validTo)}
                    </p>
                  </div>
                </div>

                {discount.minPurchase && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <ShoppingBag className="w-4 h-4" />
                      <span className="text-sm font-medium">Minimum Purchase</span>
                    </div>
                    <p className="text-gray-900 font-medium">€{discount.minPurchase}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Usage Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Uses</span>
                <span className="font-medium">{discount.currentUses || 0}</span>
              </div>
              {discount.maxUses && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Maximum Uses</span>
                  <span className="font-medium">{discount.maxUses}</span>
                </div>
              )}
              {discount.maxUsesPerUser && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Max Uses Per User</span>
                  <span className="font-medium">{discount.maxUsesPerUser}</span>
                </div>
              )}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Created</span>
                  <span className="text-sm">{formatDate(discount.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-sm">{formatDate(discount.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Single Use Only</span>
                {discount.isSingleUse ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Stackable</span>
                {discount.isStackable ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Active</span>
                {discount.isActive ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
          </div>

          {/* Categories & Restrictions */}
          {(discount.applicableCategories.length > 0 || discount.excludedItems.length > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Restrictions</h2>
              {discount.applicableCategories.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Applicable Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {discount.applicableCategories.map((cat, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {discount.excludedItems.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Excluded Items:</p>
                  <div className="flex flex-wrap gap-2">
                    {discount.excludedItems.map((item, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}