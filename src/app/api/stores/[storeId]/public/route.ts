//src/app/api/stores/[storeId]/public/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* GET store public data */
export async function GET(
  _: Request,
  { params }: { params: { storeId: string } }
) {
  const store = await prisma.store.findUnique({
    where: { id: params.storeId },
    select: {
      id: true,
      name: true,
      description: true,
      website: true,
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
          OR: [
            { type: "LOGO" },
            { type: "STOREFRONT" },
            { type: "GALLERY" },
          ],
        },
        select: {
          id: true,
          imageUrl: true,
          type: true,
          description: true,
          categoryId: true,
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

/* UPDATE store email */
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { email } = await req.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const updatedStore = await prisma.store.update({
      where: { id: params.storeId },
      data: { email },
    });

    return NextResponse.json({
      success: true,
      message: "Store email updated successfully",
      store: {
        id: updatedStore.id,
        name: updatedStore.name,
        email: updatedStore.email
      }
    });
  } catch (error: any) {
    console.error("Error updating store email:", error);
    
    // Handle case where store doesn't exist
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update store email", details: error.message },
      { status: 500 }
    );
  }
}

