//src/app/api/admin/fix-email/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const storeId = "cmk2t048w0002l404kwg5uir5";
    const newEmail = "contact@belles-femmes-example.com"; // Change to desired email
    
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: { email: newEmail },
    });
    
    return NextResponse.json({
      success: true,
      message: `Email updated to: ${newEmail}`,
      store: {
        id: updatedStore.id,
        storeName: updatedStore.storeName,
        email: updatedStore.email
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: "Make sure the store ID is correct and you have database permissions"
    }, { status: 500 });
  }
}