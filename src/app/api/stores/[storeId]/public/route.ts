//src/app/api/stores/[storeId]/public/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: { storeId: string } }
) {
  const store = await prisma.store.findUnique({
    where: { id: params.storeId },
    select: {
      id: true,
      name: true,
      email: true,
      phoneCountry: true,
      phoneArea: true,
      phoneNumber: true,
      country: true,
      city: true,
      state: true,
      zip: true,
      street: true,
      streetNumber: true,
      floor: true,
      acceptedCurrencies: true,
      categories: true,
      openingHours: true,
      images: {
  where: {
    status: "ACTIVE",
  },
  select: {
    id: true,
    imageUrl: true,
    type: true,
  },
},

      items: {
  where: {
    visible: true,
  },
  select: {
    id: true,
    name: true,
    category: true,
    description: true,
    price: true,
    images: {
      select: {
        id: true,
        imageUrl: true,
      },
    },
  },
},

    },
  });

  if (!store) {
    return NextResponse.json(
      { error: "Store not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(store);
}
