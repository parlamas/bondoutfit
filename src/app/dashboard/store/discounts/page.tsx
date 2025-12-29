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
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [loading, setLoading] = useState(false);

  // Protect page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }

    if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "STORE_MANAGER"
    ) {
      router.replace("/");
    }
  }, [status, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/store/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        discountPercent,
        validFrom,
        validTo,
      }),
    });

    setLoading(false);

    if (res.ok) {
      alert("Discount created");
      router.push("/dashboard/store");
    } else {
      alert("Failed to create discount");
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Create Scheduled Visit Discount
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            required
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Discount (%)
          </label>
          <input
            type="number"
            min={1}
            max={100}
            required
            value={discountPercent}
            onChange={e => setDiscountPercent(Number(e.target.value))}
            className="w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Valid From
          </label>
          <input
            type="date"
            required
            value={validFrom}
            onChange={e => setValidFrom(e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Valid To
          </label>
          <input
            type="date"
            required
            value={validTo}
            onChange={e => setValidTo(e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          {loading ? "Creating…" : "Create Discount"}
        </button>
      </form>
    </div>
  );
}
