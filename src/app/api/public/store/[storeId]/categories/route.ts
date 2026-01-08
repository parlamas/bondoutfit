//src/app/api/public/store/[storeId]/categories/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { storeId: string } }
) {
  const categories = await prisma.storeCategory.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      title: true,
    },
  });

  return NextResponse.json(categories);
}
