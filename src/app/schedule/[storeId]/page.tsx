// src/app/schedule/[storeId]/page.tsx

"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useParams } from "next/navigation";

export default function ScheduleVisitPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const storeId = params.storeId as string;

  // While loading, render nothing
  if (status === "loading") {
    return null;
  }

  // Not signed in → sign in
  if (!session) {
    redirect("/auth/signin");
  }

  // Signed in but not customer → go home
  if ((session.user as any)?.role !== "CUSTOMER") {
    redirect("/");
  }

  return (
  <div className="max-w-3xl mx-auto mt-12 px-6">
    <h1 className="text-2xl font-semibold mb-6">
      Schedule Your Visit
    </h1>

    <form
      onSubmit={async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        const date = (form.elements.namedItem("date") as HTMLInputElement).value;
        const time = (form.elements.namedItem("time") as HTMLInputElement).value;

        const res = await fetch("/api/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId,
            scheduledDate: date,
            scheduledTime: time,
          }),
        });

        if (res.ok) {
          window.location.href = "/dashboard";
        }
      }}
      className="bg-white rounded-xl shadow p-6 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1">
          Visit Date
        </label>
        <input
          type="date"
          name="date"
          required
          className="w-full border rounded-md p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Visit Time
        </label>
        <input
          type="time"
          name="time"
          required
          className="w-full border rounded-md p-2"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        Schedule Visit
      </button>
    </form>
  </div>
);

}
