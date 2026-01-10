//src/app/api/store/discounts/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get a single discount for editing
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "STORE_MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const discount = await prisma.discount.findFirst({
      where: {
        id: params.id,
        store: {
          managerId: (session.user as any).id,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        discountPercent: true,
        discountAmount: true,
        validFrom: true,
        validTo: true,
        code: true,
        type: true,
        minPurchase: true,
        maxDiscount: true,
        svdOnly: true,
        applicableCategories: true,
        excludedItems: true,
        maxUses: true,
        maxUsesPerUser: true,
        isSingleUse: true,
        isStackable: true,
        status: true,
        isActive: true,
        storeId: true,
      },
    });

    if (!discount) {
      return NextResponse.json(
        { error: "Discount not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(discount);
  } catch (error: any) {
    console.error("Get discount error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a discount
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      code,
      type,
      minPurchase,
      maxDiscount,
      svdOnly,
      applicableCategories,
      excludedItems,
      maxUses,
      maxUsesPerUser,
      isSingleUse,
      isStackable,
    } = body;

    // Validate required fields
    if (!title || !validFrom || !validTo) {
      return NextResponse.json(
        { error: "Title, validFrom, and validTo are required" },
        { status: 400 }
      );
    }

    // Validate discount value based on type
    if (type === "PERCENTAGE" && (!discountPercent || discountPercent < 1 || discountPercent > 100)) {
      return NextResponse.json(
        { error: "Percentage discount must be between 1 and 100" },
        { status: 400 }
      );
    }

    if (type === "AMOUNT" && (!discountAmount || discountAmount < 0)) {
      return NextResponse.json(
        { error: "Amount discount must be positive" },
        { status: 400 }
      );
    }

    // Verify discount belongs to manager's store
    const existingDiscount = await prisma.discount.findFirst({
      where: {
        id: params.id,
        store: {
          managerId: (session.user as any).id,
        },
      },
    });

    if (!existingDiscount) {
      return NextResponse.json(
        { error: "Discount not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if code is unique (if provided)
    if (code && code !== existingDiscount.code) {
      const codeExists = await prisma.discount.findFirst({
        where: {
          code,
          id: { not: params.id },
          store: {
            managerId: (session.user as any).id,
          },
        },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Discount code already exists in your store" },
          { status: 400 }
        );
      }
    }

    const updatedDiscount = await prisma.discount.update({
      where: { id: params.id },
      data: {
        title,
        description,
        discountPercent: type === "PERCENTAGE" ? discountPercent : null,
        discountAmount: type === "AMOUNT" ? discountAmount : null,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        code: code || null,
        type,
        minPurchase,
        maxDiscount,
        svdOnly,
        applicableCategories: applicableCategories || [],
        excludedItems: excludedItems || [],
        maxUses,
        maxUsesPerUser,
        isSingleUse,
        isStackable,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Discount updated successfully",
      discount: updatedDiscount,
    });
  } catch (error: any) {
    console.error("Update discount error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a discount
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "STORE_MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify discount belongs to manager's store
    const discount = await prisma.discount.findFirst({
      where: {
        id: params.id,
        store: {
          managerId: (session.user as any).id,
        },
      },
    });

    if (!discount) {
      return NextResponse.json(
        { error: "Discount not found or unauthorized" },
        { status: 404 }
      );
    }

    // Soft delete by setting status to DELETED
    const deletedDiscount = await prisma.discount.update({
      where: { id: params.id },
      data: { 
        status: "DELETED",
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Discount deleted successfully",
      discount: deletedDiscount,
    });
  } catch (error: any) {
    console.error("Delete discount error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}