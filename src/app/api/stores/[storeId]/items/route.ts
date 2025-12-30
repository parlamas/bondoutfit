// src/app/api/stores/[storeId]/items/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const items = await prisma.storeItem.findMany({
    where: {
      storeId: params.storeId,
      visible: true,
    },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(items);
}
