// src/app/api/stores/[storeId]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { storeId: string } }
) {
  const store = await prisma.store.findUnique({
    where: { id: params.storeId },
    include: {
      items: {
        where: { visible: true },
        include: {
          images: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
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
