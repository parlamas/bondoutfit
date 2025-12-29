// src/app/api/store/discounts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* =========================
   CREATE DISCOUNT
========================= */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "STORE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    storeId,
    title,
    description,
    discountPercent,
    discountAmount,
    validFrom,
    validTo,
    maxUses,
  } = body;

  if (!storeId) {
    return NextResponse.json(
      { error: "storeId is required" },
      { status: 400 }
    );
  }

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      managerId: (session.user as any).id,
    },
  });

  if (!store) {
    return NextResponse.json(
      { error: "Store not found or unauthorized" },
      { status: 403 }
    );
  }

  const discount = await prisma.discount.create({
    data: {
      storeId,
      title,
      description,
      discountPercent,
      discountAmount,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      maxUses,
    },
  });

  return NextResponse.json(discount, { status: 201 });
}

/* =========================
   LIST MANAGER DISCOUNTS
========================= */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "STORE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discounts = await prisma.discount.findMany({
    where: {
      store: {
        managerId: (session.user as any).id,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      store: {
        select: { name: true },
      },
    },
  });

  return NextResponse.json(discounts);
}
