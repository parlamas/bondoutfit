// src/app/stores/[storeId]/page.tsx

import Image from "next/image";
import { headers } from "next/headers";

type StoreCategory = {
  id: string;
  title: string;
  images: {
    id: string;
    imageUrl: string;
    description: string | null;
  }[];
};


type StoreImage = {
  id: string;
  imageUrl: string;
  type: "LOGO" | "STOREFRONT" | "GALLERY";
  description: string | null;
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
  description: string | null;
  website: string | null;
  email: string | null;
  phoneNumber: string | null;
  categories: string[];
  acceptedCurrencies: string[];
  openingHours: any | null;


  country: string;
  city: string;
  state: string;
  zip: string;
  street: string;
  streetNumber: string;
  floor: string | null;

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

async function getStoreCategories(storeId: string): Promise<StoreCategory[]> {
  const headersList = headers();
  const host = headersList.get("host");

  if (!host) throw new Error("Host header not found");

  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(
    `${protocol}://${host}/api/stores/${storeId}/categories`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  return res.json();
}


export default async function StorePage({
  params,
}: {
  params: { storeId: string };
}) {
  const store = await getStore(params.storeId);
  const categories = await getStoreCategories(params.storeId);


  return (
    <div className="max-w-5xl mx-auto p-6 space-y-12">

      {/* HEADER */}
      <section className="flex items-start gap-6">
        {store.images.find(i => i.type === "LOGO") && (
  <Image
    src={store.images.find(i => i.type === "LOGO")!.imageUrl}
    alt={`${store.name} logo`}
    width={120}
    height={120}
    className="rounded"
  />
)}


        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">{store.name}</h1>

{store.description && (
  <p className="text-gray-700 mt-1">
    {store.description}
  </p>
)}


          {store.website && (
  <div className="text-gray-700">
    Website:{" "}
    <a
      href={store.website}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 hover:underline underline-offset-4"
    >
      {store.website}
    </a>
  </div>
)}

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
  Store type: {store.categories.join(", ")}
</div>

<div className="text-gray-700">
  Accepted currencies:{" "}
  {store.acceptedCurrencies.join(", ")}
</div>


          {store.openingHours && (
  <details className="mt-2">
    <summary className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium text-gray-800 cursor-pointer hover:bg-gray-100 transition">
      Opening hours
    </summary>

    <div className="mt-3 bg-gray-50 border rounded-md divide-y text-sm">
  {(store.openingHours as {
    day: string;
    open: string;
    close: string;
    closed: boolean;
  }[]).map((d) => (
    <div
      key={d.day}
      className="flex justify-between px-4 py-2"
    >
      <span className="font-medium text-gray-800">
        {d.day}
      </span>

      <span className="text-gray-700">
        {d.closed
          ? "Closed"
          : `${d.open} – ${d.close}`}
      </span>
    </div>
  ))}
</div>

  </details>
)}

        </div>
      </section>

      {/* STOREFRONT IMAGE */}
{store.images.find(i => i.type === "STOREFRONT") && (
  <section>
    <Image
      src={store.images.find(i => i.type === "STOREFRONT")!.imageUrl}
      alt="Storefront"
      width={1200}
      height={500}
      className="rounded-lg object-cover"
    />
  </section>
)}

{/* STORE CATEGORIES */}
{categories.length > 0 && (
  <section className="space-y-12">
    {categories.map((category) => (
      <div key={category.id}>
        <h2 className="text-2xl font-semibold mb-4">
          {category.title}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {category.images.map((img) => (
            <div key={img.id} className="space-y-1">
              <Image
                src={img.imageUrl}
                alt={img.description || category.title}
                width={300}
                height={300}
                className="rounded object-cover"
              />

              {img.description && (
                <p className="text-sm text-gray-600">
                  {img.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ))}
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
