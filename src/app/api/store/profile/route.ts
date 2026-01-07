// src/app/api/store/profile/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StoreImageType } from "@prisma/client";


export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "STORE_MANAGER") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = (session.user as any).id;

  const store = await prisma.store.findUnique({
  where: { managerId: userId },
  include: {
  manager: {
    select: {
      email: true,
    },
  },
  images: {
    orderBy: { order: 'asc' },
  },
},

  });

  if (!store) {
    return NextResponse.json(null);
  }

const logo = store.images.find(i => i.type === StoreImageType.LOGO) ?? null;
const storefront = store.images.find(i => i.type === StoreImageType.STOREFRONT) ?? null;
const galleryImages = store.images.filter(i => i.type === StoreImageType.GALLERY);
const { images, manager, ...storeData } = store;

return NextResponse.json({
  ...storeData,
  email: manager?.email ?? null,
  logo: logo ? { id: logo.id, url: logo.imageUrl } : null,
  storefront: storefront ? { id: storefront.id, url: storefront.imageUrl } : null,
  galleryImages: galleryImages.map(img => ({
    id: img.id,
    url: img.imageUrl,
    description: img.description ?? "",
    type: "gallery",
    order: img.order,
  })),
});


}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "STORE_MANAGER") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = (session.user as any).id;

  try {
    const body = await request.json();
    
    // Find the store
    const store = await prisma.store.findUnique({
  where: { managerId: userId },
});

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // Update the store
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
  ...(body.name !== undefined && { name: body.name }),
  ...(body.description !== undefined && { description: body.description }),
  ...(body.website !== undefined && { website: body.website }),
  ...(body.phoneCountry !== undefined && { phoneCountry: body.phoneCountry }),
  ...(body.phoneArea !== undefined && { phoneArea: body.phoneArea }),
  ...(body.phoneNumber !== undefined && { phoneNumber: body.phoneNumber }),
  ...(body.categories !== undefined && { categories: body.categories }),
  ...(body.acceptedCurrencies !== undefined && { acceptedCurrencies: body.acceptedCurrencies }),
  ...(body.openingHours !== undefined && { openingHours: body.openingHours }),
},

    });

    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error("Failed to update store profile:", error);
    return NextResponse.json(
      { error: "Failed to update store profile" },
      { status: 500 }
    );
  }
}