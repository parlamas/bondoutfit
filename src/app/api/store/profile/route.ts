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

  const store = await prisma.store.findFirst({
    where: { managerId: userId },
    select: {
      name: true,
      email: true,
      phoneCountry: true,
      phoneArea: true,
      phoneNumber: true,
      currency: true,
      country: true,
      city: true,
      state: true,
      zip: true,
      street: true,
      streetNumber: true,
      floor: true,
    },
  });

  if (!store) {
    return NextResponse.json(null);
  }

  return NextResponse.json(store);
}
