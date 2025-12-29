// src/app/api/visits/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const visits = await prisma.visit.findMany({
    where: {
      userId,
    },
    orderBy: {
      scheduledDate: "desc",
    },
    include: {
      discount: {
        select: {
          title: true,
          discountPercent: true,
          discountAmount: true,
          store: {
            select: {
              id: true,
              name: true,
              city: true,
              country: true,
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
      discountUnlocked: v.discountUnlocked,
      discountUsed: v.discountUsed,
      discount: v.discount
        ? {
            title: v.discount.title,
            discountPercent: v.discount.discountPercent,
            discountAmount: v.discount.discountAmount,
          }
        : null,
      store: v.discount
        ? {
            id: v.discount.store.id,
            name: v.discount.store.name,
            city: v.discount.store.city,
            country: v.discount.store.country,
          }
        : null,
    }))
  );
}
