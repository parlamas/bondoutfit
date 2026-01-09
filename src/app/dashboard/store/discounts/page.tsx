// src/app/dashboard/store/discounts/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CreateDiscountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Inline error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  // Protect page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/store/signin");
    }

    if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "STORE_MANAGER"
    ) {
      router.replace("/");
    }
  }, [status, session, router]);

  function validateForm() {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!discountPercent || discountPercent <= 0 || discountPercent > 100) {
      newErrors.discountPercent = "Discount must be between 1 and 100%";
    }
    
    if (!validFrom) {
      newErrors.validFrom = "Valid from date is required";
    }
    
    if (!validTo) {
      newErrors.validTo = "Valid to date is required";
    }
    
    if (validFrom && validTo) {
      const fromDate = new Date(validFrom);
      const toDate = new Date(validTo);
      
      if (toDate <= fromDate) {
        newErrors.validTo = "Valid to must be after valid from";
      }
      
      // Optional: Check if dates are in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (fromDate < today) {
        newErrors.validFrom = "Valid from cannot be in the past";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setFormError("");
  setErrors({});
  
  if (!validateForm()) {
    setFormError("Please fix the errors below");
    return;
  }
  
  setLoading(true);

  try {
    const res = await fetch("/api/store/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        discountPercent,  // Send as number
        validFrom: new Date(validFrom).toISOString(),  // Convert to ISO string
        validTo: new Date(validTo).toISOString(),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // Success - redirect to discounts list
      router.push("/dashboard/store/discounts");
    } else {
      // Show field-specific errors inline
      if (data.field && data.error) {
        setErrors({ [data.field]: data.error });
      } else {
        setFormError(data.error || "Failed to create discount");
      }
    }
  } catch (error) {
    setFormError("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
}

  // Helper to format today's date for date input min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Create Scheduled Visit Discount
      </h1>

      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={`w-full border rounded-md p-2 ${errors.title ? 'border-red-500' : ''}`}
            placeholder="Scheduled Visit Discount (SVD)"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={`w-full border rounded-md p-2 ${errors.description ? 'border-red-500' : ''}`}
            placeholder="This is the classical SVD for all customers who show up at the scheduled time and day of their choice."
            rows={3}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Discount (%)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={discountPercent}
            onChange={e => setDiscountPercent(Number(e.target.value))}
            className={`w-full border rounded-md p-2 ${errors.discountPercent ? 'border-red-500' : ''}`}
          />
          {errors.discountPercent && (
            <p className="mt-1 text-sm text-red-600">{errors.discountPercent}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Valid From
          </label>
          <input
            type="date"
            min={today}
            value={validFrom}
            onChange={e => setValidFrom(e.target.value)}
            className={`w-full border rounded-md p-2 ${errors.validFrom ? 'border-red-500' : ''}`}
          />
          {errors.validFrom && (
            <p className="mt-1 text-sm text-red-600">{errors.validFrom}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Valid To
          </label>
          <input
            type="date"
            min={validFrom || today}
            value={validTo}
            onChange={e => setValidTo(e.target.value)}
            className={`w-full border rounded-md p-2 ${errors.validTo ? 'border-red-500' : ''}`}
          />
          {errors.validTo && (
            <p className="mt-1 text-sm text-red-600">{errors.validTo}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Creating…" : "Create Discount"}
        </button>
      </form>
    </div>
  );
}