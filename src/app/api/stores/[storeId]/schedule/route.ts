//src/app/api/stores/[storeId]/schedule/route.ts

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
      country: true,
      city: true,
      openingHours: true,
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
