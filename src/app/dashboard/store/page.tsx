// src/app/dashboard/store/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Visit = {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  discountUnlocked: boolean;
  discountUsed: boolean;
  customer: {
    name: string | null;
    gender: string | null;
    age: number | null;
    heightCm: number | null;
    weightKg: number | null;
  };
};


export default function StoreDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch visits
  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/store/visits")
      .then(res => res.json())
      .then(data => setVisits(data))
      .finally(() => setLoading(false));
  }, [status]);

  if (loading) {
    return <div className="p-6">Loading scheduled visits…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">
  Upcoming Scheduled Visits
</h1>

<a
  href="/dashboard/store/discounts"
  className="inline-block mb-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
>
  Create Discount
</a>


      {visits.length === 0 ? (
        <p className="text-gray-600">No upcoming visits.</p>
      ) : (
        <div className="space-y-4">
          {visits.map(v => (
            <div
              key={v.id}
              className="border rounded-lg p-4 bg-white"
            >
              <div className="font-medium mb-1">
                Customer: {v.customer.name || "Unnamed"}
              </div>

              <div className="text-sm text-gray-700">
                {v.scheduledDate} at {v.scheduledTime}
              </div>

              <div className="mt-2 text-sm text-gray-600">
                Gender: {v.customer.gender ?? "—"} · Age:{" "}
                {v.customer.age ?? "—"}
              </div>

              <div className="text-sm text-gray-600">
                Height: {v.customer.heightCm ?? "—"} cm · Weight:{" "}
                {v.customer.weightKg ?? "—"} kg
              </div>

              <div className="mt-1 text-sm font-medium">
  Status: {v.status}
</div>

{v.discountUnlocked && (
  <div className="mt-2 text-sm font-medium text-green-700">
    Discount unlocked
  </div>
)}

{v.status === "SCHEDULED" && (
  <button
    className="mt-3 rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
    onClick={async () => {
      await fetch("/api/store/visits/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId: v.id }),
      });

      setVisits(prev =>
        prev.map(x =>
          x.id === v.id
            ? { ...x, status: "COMPLETED", discountUnlocked: true }
            : x
        )
      );
    }}
  >
    Mark visit completed (unlock discount)
  </button>
)}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
