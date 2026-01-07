//src/app/api/stores/[storeId]/categories/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: { storeId: string } }
) {
  const categories = await prisma.storeCategory.findMany({
    where: { storeId: params.storeId },
    orderBy: { order: "asc" },
    include: {
      images: {
        where: { status: "ACTIVE" },
        orderBy: { order: "asc" },
        select: {
          id: true,
          imageUrl: true,
          description: true,
          order: true,
        },
      },
    },
  });

  return NextResponse.json(categories);
}
