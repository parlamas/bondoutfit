// src/app/schedule/[storeId]/page.tsx

import { headers } from "next/headers";

type Store = {
  id: string;
  name: string;
  country: string;
  city: string;
};

async function getStore(storeId: string): Promise<Store> {
  const headersList = headers();
  const host = headersList.get("host");

  if (!host) {
    throw new Error("Host header not found");
  }

  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/stores/${storeId}/public`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to load store");
  }

  return res.json();
}

export default async function SchedulePage({
  params,
}: {
  params: { storeId: string };
}) {
  const store = await getStore(params.storeId);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">
        Schedule a Visit
      </h1>

      <div className="bg-white rounded-lg shadow p-4 space-y-1">
        <div className="font-medium text-lg">
          {store.name}
        </div>
        <div className="text-gray-600">
          {store.city}, {store.country}
        </div>
      </div>

      <div className="text-gray-700">
        Scheduling UI goes here.
      </div>
    </div>
  );
}
