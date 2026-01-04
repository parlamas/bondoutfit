// src/app/api/store/profile/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  select: {
      id: true,
      name: true,
      email: true,
      phoneCountry: true,
      phoneArea: true,
      phoneNumber: true,
      acceptedCurrencies: true,
      country: true,
      city: true,
      state: true,
      zip: true,
      street: true,
      streetNumber: true,
      floor: true,
      categories: true,
    },
  });

  if (!store) {
    return NextResponse.json(null);
  }

  return NextResponse.json(store);
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
  acceptedCurrencies: body.acceptedCurrencies,
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