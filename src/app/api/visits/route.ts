// src/app/api/visits/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const visits = await prisma.visit.findMany({
    where: {
      userId: (session.user as any).id,
    },
    orderBy: {
      scheduledDate: "desc",
    },
    include: {
      discount: {
        select: {
          storeManager: {
            select: {
              storeName: true,
              city: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(
    visits.map(v => ({
      id: v.id,
      scheduledDate: v.scheduledDate.toISOString().slice(0, 10),
      scheduledTime: v.scheduledTime,
      status: v.status,
      store: {
        storeName: v.discount.storeManager.storeName,
        city: v.discount.storeManager.city,
      },
    }))
  );
}
