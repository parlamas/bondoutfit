//src/app/dashboard/store/discounts/edit/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Tag, AlertCircle, CheckCircle, XCircle } from "lucide-react";

type DiscountFormData = {
  title: string;
  description: string;
  discountPercent: number | null;
  discountAmount: number | null;
  validFrom: string;
  validTo: string;
  code: string;
  type: "PERCENTAGE" | "AMOUNT" | "FREE_SHIPPING";
  minPurchase: number | null;
  maxDiscount: number | null;
  svdOnly: boolean;
  applicableCategories: string[];
  excludedItems: string[];
  maxUses: number | null;
  maxUsesPerUser: number | null;
  isSingleUse: boolean;
  isStackable: boolean;
};

type MessageType = 'success' | 'error' | 'info' | null;

export default function EditDiscountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const discountId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<DiscountFormData>({
    title: "",
    description: "",
    discountPercent: null,
    discountAmount: null,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    code: "",
    type: "PERCENTAGE",
    minPurchase: null,
    maxDiscount: null,
    svdOnly: false,
    applicableCategories: [],
    excludedItems: [],
    maxUses: null,
    maxUsesPerUser: null,
    isSingleUse: false,
    isStackable: false,
  });
  
  const [message, setMessage] = useState<{ type: MessageType; text: string } | null>(null);

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
        setFormData({
          title: data.title || "",
          description: data.description || "",
          discountPercent: data.discountPercent || null,
          discountAmount: data.discountAmount || null,
          validFrom: data.validFrom ? new Date(data.validFrom).toISOString().split('T')[0] : "",
          validTo: data.validTo ? new Date(data.validTo).toISOString().split('T')[0] : "",
          code: data.code || "",
          type: data.type || "PERCENTAGE",
          minPurchase: data.minPurchase || null,
          maxDiscount: data.maxDiscount || null,
          svdOnly: data.svdOnly || false,
          applicableCategories: data.applicableCategories || [],
          excludedItems: data.excludedItems || [],
          maxUses: data.maxUses || null,
          maxUsesPerUser: data.maxUsesPerUser || null,
          isSingleUse: data.isSingleUse || false,
          isStackable: data.isStackable || false,
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to load discount data. Please try again.' });
        setTimeout(() => router.back(), 2000);
      }
    } catch (error) {
      console.error("Failed to load discount", error);
      setMessage({ type: 'error', text: 'Failed to load discount. Please check your connection.' });
      setTimeout(() => router.back(), 2000);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/store/discounts/${discountId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Discount updated successfully! Redirecting...' });
        setTimeout(() => {
          router.push("/dashboard/store/discounts/list");
        }, 1500);
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: `Failed to update: ${error.error || 'Unknown error'}` });
      }
    } catch (error) {
      console.error("Failed to update discount", error);
      setMessage({ type: 'error', text: 'Failed to update discount. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }

  if (loading) return <div className="p-6 inline">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="inline">Back to Discounts</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 inline">Edit Discount</h1>
        <p className="text-gray-600 ml-4 mt-2 inline">Update your discount details</p>
      </div>

      {/* Inline Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : message.type === 'error' 
            ? 'bg-red-50 border border-red-200 text-red-800' 
            : 'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          {message.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
          {message.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
          {message.type === 'info' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="inline">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 inline">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 inline">
              Discount Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Summer Sale, Black Friday Discount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 inline">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your discount offer..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 inline">
                Discount Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PERCENTAGE">Percentage Off</option>
                <option value="AMOUNT">Amount Off</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
              </select>
            </div>

            {formData.type === "PERCENTAGE" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 inline">
                  Discount Percentage *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="discountPercent"
                    value={formData.discountPercent || ''}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 20"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 inline">%</span>
                </div>
              </div>
            )}

            {formData.type === "AMOUNT" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 inline">
                  Discount Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 inline">€</span>
                  <input
                    type="number"
                    name="discountAmount"
                    value={formData.discountAmount || ''}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 10"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 inline">Validity Period</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 inline">
                Valid From *
              </label>
              <input
                type="date"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 inline">
                Valid To *
              </label>
              <input
                type="date"
                name="validTo"
                value={formData.validTo}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 inline">Advanced Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 inline">
                  Discount Code (Optional)
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="e.g., SUMMER2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 inline">
                  Minimum Purchase (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 inline">€</span>
                  <input
                    type="number"
                    name="minPurchase"
                    value={formData.minPurchase || ''}
                    onChange={handleChange}
                    min="0"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="No minimum"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="svdOnly"
                  checked={formData.svdOnly}
                  onChange={handleChange}
                  id="svdOnly"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="svdOnly" className="text-sm text-gray-700 inline">
                  Scheduled Visit Discount Only
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 inline">
                  Maximum Discount (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 inline">€</span>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount || ''}
                    onChange={handleChange}
                    min="0"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="No maximum"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isStackable"
                  checked={formData.isStackable}
                  onChange={handleChange}
                  id="isStackable"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isStackable" className="text-sm text-gray-700 inline">
                  Stackable with other discounts
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="inline">Cancel</span>
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span className="inline">{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}