// src/app/stores/[storeId]/page.tsx

import Image from "next/image";
import { headers } from "next/headers";

type StoreImage = {
  id: string;
  imageUrl: string;
};

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
  email: string | null;
  phoneNumber: string | null;
  acceptedCurrencies: string[];
  openingHours: any | null;

  country: string;
  city: string;
  state: string;
  zip: string;
  street: string;
  streetNumber: string;
  floor: string | null;

  logoUrl: string | null;
  storefrontUrl: string | null;
  images: StoreImage[];

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
    <div className="max-w-5xl mx-auto p-6 space-y-12">

      {/* HEADER */}
      <section className="flex items-start gap-6">
        {store.logoUrl && (
          <Image
            src={store.logoUrl}
            alt={`${store.name} logo`}
            width={120}
            height={120}
            className="rounded"
          />
        )}

        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">{store.name}</h1>

          {store.email && (
            <div className="text-gray-700">
              Email: {store.email}
            </div>
          )}

          {store.phoneNumber && (
            <div className="text-gray-700">
              Phone: {store.phoneNumber}
            </div>
          )}

          <div className="text-gray-700">
            {store.street} {store.streetNumber}
            {store.floor ? `, ${store.floor}` : ""}
          </div>

          <div className="text-gray-700">
            {store.zip} {store.city}, {store.state}
          </div>

          <div className="text-gray-700">{store.country}</div>

          <div className="text-gray-700">
            Accepted currencies:{" "}
            {store.acceptedCurrencies.join(", ")}
          </div>

          {store.openingHours && (
  <details className="mt-2">
    <summary className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-800 cursor-pointer hover:bg-gray-100 transition">
      Opening hours
    </summary>

    <pre className="mt-2 text-sm bg-gray-50 border rounded-md p-3 overflow-x-auto">
      {JSON.stringify(store.openingHours, null, 2)}
    </pre>
  </details>
)}

        </div>
      </section>

      {/* STOREFRONT IMAGE */}
      {store.storefrontUrl && (
        <section>
          <Image
            src={store.storefrontUrl}
            alt="Storefront"
            width={1200}
            height={500}
            className="rounded-lg object-cover"
          />
        </section>
      )}

      {/* GALLERY */}
      {store.images.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {store.images.map((img) => (
              <Image
                key={img.id}
                src={img.imageUrl}
                alt="Gallery image"
                width={300}
                height={300}
                className="rounded object-cover"
              />
            ))}
          </div>
        </section>
      )}

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
