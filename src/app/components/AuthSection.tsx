// src/app/components/AuthSection.tsx

"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

interface AuthSectionProps {
  type: "customer" | "store-manager";
  defaultSignUp?: boolean;
}

export default function AuthSection({
  type,
  defaultSignUp = false,
}: AuthSectionProps) {
  const [isSignUp, setIsSignUp] = useState(defaultSignUp);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* =========================
     FORM STATE — MATCHES API
  ========================= */

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",

    // structured phone (shared)
    phoneCountry: "",
    phoneArea: "",
    phoneNumber: "",

    // shared required address
    city: "",
    state: "",
    zip: "",

    // customer optional
    age: "",
    gender: "",
    heightCm: "",
    weightKg: "",
    occupation: "",

    // store-only
    storeName: "",
    country: "",
    street: "",
    streetNumber: "",
    floor: "",
    categories: [] as string[],
  });

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    const role = (session?.user as any)?.role;

    if (role === "CUSTOMER") window.location.href = "/dashboard";
    if (role === "STORE_MANAGER") window.location.href = "/dashboard/store";
  }, [status, session]);

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            role: type === "store-manager" ? "STORE_MANAGER" : "CUSTOMER",
          }),
        });

        if (!res.ok) {
          console.error("Signup failed");
          return;
        }

        window.location.href = "/auth/signin?verify=sent";
      } else {
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          role: type === "store-manager" ? "STORE_MANAGER" : "CUSTOMER",
          redirect: true,
          callbackUrl:
            type === "store-manager" ? "/dashboard/store" : "/dashboard",
        });
      }
    } catch (err) {
      console.error("Authentication error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div>
      <h3 className="text-lg font-semibold mb-1">
        {isSignUp ? "Create Account" : "Sign In"} as{" "}
        {type === "customer" ? "Customer" : "Store Manager"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <>
            {/* Full Name */}
            <input
              type="text"
              required
              placeholder="Full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border px-4 py-2 rounded"
            />

            {/* Phone */}
<div className="grid grid-cols-3 gap-2">
  <input
    type="text"
    placeholder="Country code"
    value={formData.phoneCountry}
    onChange={(e) =>
      setFormData({ ...formData, phoneCountry: e.target.value })
    }
    className="border px-4 py-2 rounded"
  />

  <input
    type="text"
    placeholder="Area code"
    value={formData.phoneArea}
    onChange={(e) =>
      setFormData({ ...formData, phoneArea: e.target.value })
    }
    className="border px-4 py-2 rounded"
  />

  <input
    type="tel"
    required
    placeholder="Phone number"
    value={formData.phoneNumber}
    onChange={(e) =>
      setFormData({ ...formData, phoneNumber: e.target.value })
    }
    className="border px-4 py-2 rounded"
  />
</div>


            {/* City */}
            <input
              type="text"
              required
              placeholder="City / Town"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full border px-4 py-2 rounded"
            />

            {/* State */}
            <input
              type="text"
              required
              placeholder="State / Province / Region"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              className="w-full border px-4 py-2 rounded"
            />

            {/* ZIP */}
            <input
              type="text"
              required
              placeholder="ZIP / Postal code"
              value={formData.zip}
              onChange={(e) =>
                setFormData({ ...formData, zip: e.target.value })
              }
              className="w-full border px-4 py-2 rounded"
            />
          </>
        )}

        {/* STORE MANAGER EXTRA FIELDS */}
        {isSignUp && type === "store-manager" && (
          <>
            <input
              type="text"
              required
              placeholder="Store name"
              value={formData.storeName}
              onChange={(e) =>
                setFormData({ ...formData, storeName: e.target.value })
              }
              className="w-full border px-4 py-2 rounded"
            />

            <input
              type="text"
              required
              placeholder="Country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              className="w-full border px-4 py-2 rounded"
            />

            <input
              type="text"
              required
              placeholder="Street"
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
              className="w-full border px-4 py-2 rounded"
            />

            <input
              type="text"
              required
              placeholder="Street number"
              value={formData.streetNumber}
              onChange={(e) =>
                setFormData({ ...formData, streetNumber: e.target.value })
              }
              className="w-full border px-4 py-2 rounded"
            />

            <input
  type="text"
  placeholder="Floor (optional)"
  value={formData.floor}
  onChange={(e) =>
    setFormData({ ...formData, floor: e.target.value })
  }
  className="w-full border px-4 py-2 rounded"
/>


            <div className="flex gap-2">
              {["Men’s wear", "Women’s wear", "Children", "Unisex / Mixed"].map(
                (cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 border rounded ${
                      formData.categories.includes(cat)
                        ? "bg-blue-600 text-white"
                        : ""
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </>
        )}

        {/* EMAIL */}
        <input
          type="email"
          required
          placeholder="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="w-full border px-4 py-2 rounded"
        />

        {/* PASSWORD */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full border px-4 py-2 rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-600 text-sm"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
