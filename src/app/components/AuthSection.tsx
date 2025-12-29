// src/app/components/AuthSection.tsx

"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { User, Store, Mail, Lock, Eye, EyeOff } from "lucide-react";

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
  const [formData, setFormData] = useState({
  email: "",
  password: "",
  name: "",

    // customer fields
  customerCity: "",
  gender: "",
  age: 0,
  heightCm: 0,
  weightKg: 0,
  occupation: "",
  phone: "",


  // store manager fields
  storeName: "",
  country: "",
  city: "",
  street: "",
  streetNumber: "",
  floor: "",
  state: "",
  zip: "",
  categories: [] as string[],
});

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    const role = (session?.user as any)?.role;

    if (role === "CUSTOMER") {
      window.location.href = "/dashboard";
    }

    if (role === "STORE_MANAGER") {
      window.location.href = "/dashboard/store";
    }
  }, [status, session]);

const toggleCategory = (category: string) => {
  setFormData((prev) => ({
    ...prev,
    categories: prev.categories.includes(category)
      ? prev.categories.filter((c) => c !== category)
      : [...prev.categories, category],
  }));
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Handle sign up
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            role: type === "store-manager" ? "STORE_MANAGER" : "CUSTOMER",
          }),
        });

        if (res.ok) {
  window.location.href = "/auth/signin?verify=sent";
}

      } else {
        // Handle sign in
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          role: type === "store-manager" ? "STORE_MANAGER" : "CUSTOMER",
          redirect: true,
          callbackUrl: type === "store-manager" ? "/dashboard/store" : "/dashboard",
        });
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    signIn(provider, {
      callbackUrl: type === "store-manager" ? "/dashboard/store" : "/dashboard",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {isSignUp ? "Create Account" : "Sign In"} as {type === "customer" ? "Customer" : "Store Manager"}
        </h3>
        <p className="text-sm text-gray-600">
          {isSignUp
            ? `Join as ${type === "customer" ? "a customer" : "store manager"}`
            : `Access your ${type === "customer" ? "customer" : "store manager"} account`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Full Name (optional)
    </label>
    <input
      type="text"
      value={formData.name}
      onChange={(e) =>
        setFormData({ ...formData, name: e.target.value })
      }
      className="w-full px-4 py-2 border rounded-lg"
    />
  </div>
)}

        {isSignUp && type === "customer" && (
  <>
    <div>
      <label className="block text-sm font-medium mb-1">City / Town</label>
      <input
        type="text"
        required
        value={formData.customerCity}
        onChange={(e) =>
          setFormData({ ...formData, customerCity: e.target.value })
        }
        className="w-full px-4 py-2 border rounded-lg"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Gender</label>
      <select
        required
        value={formData.gender}
        onChange={(e) =>
          setFormData({ ...formData, gender: e.target.value })
        }
        className="w-full px-4 py-2 border rounded-lg"
      >
        <option value="">Select gender</option>
        <option value="female">Female</option>
        <option value="male">Male</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div className="grid grid-cols-3 gap-3">
      <div>
        <label className="block text-sm font-medium mb-1">Age</label>
        <input
          type="number"
          required
          min={1}
          value={formData.age}
            onChange={(e) =>
  setFormData({ ...formData, age: Number(e.target.value) })
}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Height (cm)</label>
        <input
          type="number"
          required
          min={50}
          value={formData.heightCm}
          onChange={(e) =>
  setFormData({ ...formData, heightCm: Number(e.target.value) })
}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Weight (kg)</label>
        <input
          type="number"
          required
          min={20}
          value={formData.weightKg}
          onChange={(e) =>
  setFormData({ ...formData, weightKg: Number(e.target.value) })
}

          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Occupation (optional)
      </label>
      <input
        type="text"
        value={formData.occupation}
        onChange={(e) =>
          setFormData({ ...formData, occupation: e.target.value })
        }
        className="w-full px-4 py-2 border rounded-lg"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Phone (optional)
      </label>
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) =>
          setFormData({ ...formData, phone: e.target.value })
        }
        className="w-full px-4 py-2 border rounded-lg"
      />
    </div>
  </>
)}


        {isSignUp && type === "store-manager" && (
  <>
    {/* Store Name */}
    <div>
      <label className="block text-sm font-medium mb-1">Store Name</label>
      <input
        type="text"
        required
        value={formData.storeName}
        onChange={(e) =>
          setFormData({ ...formData, storeName: e.target.value })
        }
        className="w-full px-4 py-2 border rounded-lg"
      />
    </div>

    {/* Country */}
    <div>
      <label className="block text-sm font-medium mb-1">Country</label>
      <input
        type="text"
        required
        value={formData.country}
        onChange={(e) =>
          setFormData({ ...formData, country: e.target.value })
        }
        className="w-full px-4 py-2 border rounded-lg"
      />
    </div>

    {/* City */}
    <div>
      <label className="block text-sm font-medium mb-1">City / Town</label>
      <input
        type="text"
        required
        value={formData.city}
        onChange={(e) =>
          setFormData({ ...formData, city: e.target.value })
        }
        className="w-full px-4 py-2 border rounded-lg"
      />
    </div>

    {/* Street + Number */}
    <div className="grid grid-cols-3 gap-3">
      <div className="col-span-2">
        <label className="block text-sm font-medium mb-1">Street</label>
        <input
          type="text"
          required
          value={formData.street}
          onChange={(e) =>
            setFormData({ ...formData, street: e.target.value })
          }
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">No.</label>
        <input
          type="text"
          required
          value={formData.streetNumber}
          onChange={(e) =>
            setFormData({ ...formData, streetNumber: e.target.value })
          }
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </div>

    {/* Floor + State */}
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium mb-1">
          Floor (optional)
        </label>
        <input
          type="text"
          value={formData.floor}
          onChange={(e) =>
            setFormData({ ...formData, floor: e.target.value })
          }
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          State / Region (optional)
        </label>
        <input
          type="text"
          value={formData.state}
          onChange={(e) =>
            setFormData({ ...formData, state: e.target.value })
          }
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </div>

    {/* ZIP */}
    <div>
      <label className="block text-sm font-medium mb-1">
        ZIP / Postal Code
      </label>
      <input
        type="text"
        required
        value={formData.zip}
        onChange={(e) =>
          setFormData({ ...formData, zip: e.target.value })
        }
        className="w-full px-4 py-2 border rounded-lg"
      />
    </div>

    {/* Categories */}
    <div>
      <label className="block text-sm font-medium mb-2">
        Store Categories
      </label>
      <div className="flex flex-wrap gap-3">
        {["Men’s wear", "Women’s wear", "Children", "Unisex / Mixed"].map(
          (cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 rounded-md border ${
                formData.categories.includes(cat)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700"
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>
    </div>
  </>
)}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="••••••••"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {!isSignUp && (
          <div className="text-right">
            <Link
              href={`/auth/forgot-password?type=${type}`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            isSignUp ? "Create Account" : "Sign In"
          )}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => handleOAuth("google")}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button
            onClick={() => handleOAuth("github")}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            GitHub
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : `Don't have an account? Sign Up as ${type === "customer" ? "Customer" : "Store Manager"}`}
        </button>
      </div>
    </div>
  );
}