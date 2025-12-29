// src/app/dashboard/page.tsx

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
  store: {
    storeName: string | null;
  };
};



export default function CustomerDashboard() {
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
      (session?.user as any)?.role !== "CUSTOMER"
    ) {
      router.replace("/");
    }
  }, [status, session, router]);

  // Fetch visits
  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/visits")
      .then(res => res.json())
      .then(data => setVisits(data))
      .finally(() => setLoading(false));
  }, [status]);

  if (loading) {
    return <div className="p-6">Loading your visits…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">My Scheduled Visits</h1>

      {visits.length === 0 ? (
        <p className="text-gray-600">You have no scheduled visits.</p>
      ) : (
        <div className="space-y-4">
          {visits.map(v => (
            <div
              key={v.id}
              className="border rounded-lg p-4 bg-white"
            >
              <div className="font-medium">
                Store: {v.store.storeName ?? "Unnamed store"}
              </div>

              <div className="text-sm text-gray-700">
                {v.scheduledDate} at {v.scheduledTime}
              </div>

              <div className="mt-1 text-sm font-medium">
                Status: {v.status}
              </div>
              {v.discountUnlocked && !v.discountUsed && (
  <div className="mt-2">
    <div className="text-sm font-medium text-green-700 mb-2">
      🎉 Your discount is unlocked for this visit
    </div>

    <button
      className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
      onClick={async () => {
        await fetch("/api/visits/use-discount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitId: v.id }),
        });

        setVisits(prev =>
          prev.map(x =>
            x.id === v.id ? { ...x, discountUsed: true } : x
          )
        );
      }}
    >
      Use discount
    </button>
  </div>
)}
{v.discountUsed && (
  <div className="mt-2 text-sm font-medium text-gray-600">
    ✅ Discount used
  </div>
)}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
