// src/app/stores/[storeId]/page.tsx

import Image from "next/image";
import { headers } from "next/headers";

type StoreItemImage = {
  id: string;
  imageUrl: string;
};

type StoreItem = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number | null;
  images: StoreItemImage[];
};

type Store = {
  id: string;
  name: string;
  phoneNumber: string | null;
  country: string;
  city: string;
  state: string;
  zip: string;
  street: string;
  streetNumber: string;
  floor: string | null;
  items: StoreItem[];
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

export default async function StorePage({
  params,
}: {
  params: { storeId: string };
}) {
  const store = await getStore(params.storeId);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* STORE INFO */}
      <section className="space-y-1">
        <h1 className="text-3xl font-semibold">{store.name}</h1>

        <div className="text-gray-700">
          {store.street} {store.streetNumber}
          {store.floor ? `, ${store.floor}` : ""}
        </div>

        <div className="text-gray-700">
          {store.zip} {store.city}, {store.state}
        </div>

        <div className="text-gray-700">{store.country}</div>

        {store.phoneNumber && (
          <div className="text-gray-700">
            Phone: {store.phoneNumber}
          </div>
        )}
      </section>

      {/* ITEMS */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">What we sell</h2>

        {store.items.length === 0 ? (
          <p className="text-gray-600">No items listed.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {store.items.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 bg-white space-y-2"
              >
                <div className="font-medium">{item.name}</div>

                <div className="text-sm text-gray-600">
                  {item.category}
                </div>

                {item.price !== null && (
                  <div className="text-sm font-medium">
                    € {(item.price / 100).toFixed(2)}
                  </div>
                )}

                {item.description && (
                  <p className="text-sm text-gray-700">
                    {item.description}
                  </p>
                )}

                {item.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {item.images.map((img) => (
                      <Image
                        key={img.id}
                        src={img.imageUrl}
                        alt={item.name}
                        width={120}
                        height={120}
                        className="rounded object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
