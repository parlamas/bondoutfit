// src/app/api/store/discounts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "STORE_MANAGER") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const {
    title,
    description,
    discountPercent,
    discountAmount,
    validFrom,
    validTo,
    maxUses,
  } = body;

  const discount = await prisma.discount.create({
    data: {
      title,
      description,
      discountPercent,
      discountAmount,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      maxUses,
      storeManagerId: (session.user as any).id,
    },
  });

  return NextResponse.json(discount, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "STORE_MANAGER") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const discounts = await prisma.discount.findMany({
    where: {
      storeManagerId: (session.user as any).id,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(discounts);
}
