//src/app/api/store/discounts/[id]/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "STORE_MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !["DRAFT", "POSTED", "DISMOUNTED", "DELETED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
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

    // When posting a discount, also set isActive to true
    const updateData: any = { status };
    if (status === "POSTED") {
      updateData.isActive = true;
    } else if (status === "DISMOUNTED" || status === "DELETED") {
      updateData.isActive = false;
    }

    const updatedDiscount = await prisma.discount.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Discount status updated to ${status}`,
      discount: updatedDiscount,
    });
  } catch (error: any) {
    console.error("Discount status update error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}