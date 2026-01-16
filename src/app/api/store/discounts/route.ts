// src/app/api/store/discounts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* =========================
   CREATE DISCOUNT
========================= */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "STORE_MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required", field: "title" },
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        { error: "Description is required", field: "description" },
        { status: 400 }
      );
    }

    if ((!discountPercent && !discountAmount) || 
        (discountPercent && (discountPercent < 1 || discountPercent > 100))) {
      return NextResponse.json(
        { error: "Valid discount percentage (1-100%) or amount is required", field: "discountPercent" },
        { status: 400 }
      );
    }

    if (!validFrom || !validTo) {
      return NextResponse.json(
        { error: "Both valid from and valid to dates are required", field: "validFrom" },
        { status: 400 }
      );
    }

    // Get store for the authenticated manager
    const store = await prisma.store.findFirst({
      where: {
        managerId: (session.user as any).id,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "No store found for this manager" },
        { status: 404 }
      );
    }

    const discount = await prisma.discount.create({
      data: {
        storeId: store.id,
        title: title.trim(),
        description: description.trim(),
        discountPercent: discountPercent || null,
        discountAmount: discountAmount || null,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        maxUses: maxUses || null,
        type: discountPercent ? "PERCENTAGE" : "AMOUNT",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Discount created successfully",
      discount
    }, { status: 201 });
  } catch (error: any) {
    console.error("Discount creation error:", error);
    
    // Handle date parsing errors
    if (error instanceof RangeError || error.message.includes("Invalid Date")) {
      return NextResponse.json(
        { error: "Invalid date format. Please use YYYY-MM-DD", field: "validFrom" },
        { status: 400 }
      );
    }

    // Handle database constraints
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A discount with similar details already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
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
        select: { storeName: true },
      },
    },
  });

  return NextResponse.json(discounts);
}
