// src/app/dashboard/store/discounts/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RefreshCw, Copy, Check } from 'lucide-react';

export default function CreateDiscountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Discount code generation state
  const [code, setCode] = useState("");
  const [codePrefix, setCodePrefix] = useState("SVD");
  const [codeLength, setCodeLength] = useState(8);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeLetters, setIncludeLetters] = useState(true);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
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

  function generateDiscountCode() {
    const chars = [];
    if (includeLetters) chars.push(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (includeNumbers) chars.push(...'0123456789');
    
    if (chars.length === 0) {
      setCode(""); // No characters selected
      return;
    }
    
    let randomPart = '';
    for (let i = 0; i < codeLength; i++) {
      randomPart += chars[Math.floor(Math.random() * chars.length)];
    }
    
    const newCode = codePrefix ? `${codePrefix}${randomPart}` : randomPart;
    setCode(newCode);
    
    // Add to generated codes history (keep last 5)
    setGeneratedCodes(prev => {
      const updated = [newCode, ...prev].slice(0, 5);
      return updated;
    });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function generateBulkCodes(count: number) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const chars = [];
      if (includeLetters) chars.push(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      if (includeNumbers) chars.push(...'0123456789');
      
      let randomPart = '';
      for (let j = 0; j < codeLength; j++) {
        randomPart += chars[Math.floor(Math.random() * chars.length)];
      }
      
      const newCode = codePrefix ? `${codePrefix}${randomPart}` : randomPart;
      codes.push(newCode);
    }
    setGeneratedCodes(codes);
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
          code: code || undefined, // Add the generated code
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success - redirect to discounts list
        router.push("/dashboard/store/discounts/list");
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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Create Scheduled Visit Discount
      </h1>

      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
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
            Description *
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
            Discount (%) *
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

        {/* Discount Code Generation */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <h3 className="font-medium text-gray-900 mb-4">Discount Code (Optional)</h3>
          
          <div className="space-y-4">
            {/* Code Input with Generate Button */}
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="flex-1 border border-gray-300 rounded-md p-2 font-mono"
                placeholder="e.g., SVDX7B9A or leave blank for no code"
              />
              <button
                type="button"
                onClick={generateDiscountCode}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Generate
              </button>
            </div>
            
            {/* Code Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prefix
                </label>
                <input
                  type="text"
                  value={codePrefix}
                  onChange={e => setCodePrefix(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-md p-2 font-mono"
                  placeholder="e.g., SVD"
                  maxLength={5}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length
                </label>
                <select
                  value={codeLength}
                  onChange={e => setCodeLength(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value={6}>6 characters</option>
                  <option value={8}>8 characters</option>
                  <option value={10}>10 characters</option>
                  <option value={12}>12 characters</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Characters
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeLetters}
                      onChange={e => setIncludeLetters(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Letters (A-Z)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeNumbers}
                      onChange={e => setIncludeNumbers(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Numbers (0-9)</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Generated Codes History */}
            {generatedCodes.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Recently Generated Codes:</p>
                <div className="space-y-2">
                  {generatedCodes.map((genCode, index) => (
                    <div key={index} className="flex items-center justify-between bg-white border border-gray-300 rounded-md p-3">
                      <code className="font-mono text-gray-900">{genCode}</code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(genCode)}
                        className="p-2 text-gray-600 hover:text-blue-600"
                        title="Copy code"
                      >
                        {copiedCode === genCode ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Bulk Generation */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Generate Multiple Codes:</p>
                  <div className="flex gap-2">
                    {[3, 5, 10].map(count => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => generateBulkCodes(count)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                      >
                        {count} codes
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              Tip: Leave blank if you don't want a code. Customers will get discount automatically after check-in.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Valid From *
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
            Valid To *
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
          className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-medium"
        >
          {loading ? "Creating…" : "Create Discount"}
        </button>
      </form>
    </div>
  );
}