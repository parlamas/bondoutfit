//src/app/api/store/discounts/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const updatedDiscount = await prisma.discount.update({
      where: { id: params.id },
      data: { status: "DELETED" },
    });

    return NextResponse.json({
      success: true,
      message: "Discount deleted successfully",
      discount: updatedDiscount,
    });
  } catch (error: any) {
    console.error("Discount delete error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}