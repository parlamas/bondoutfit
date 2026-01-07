//src/app/api/store/categories/[categoryId]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  _: Request,
  { params }: { params: { categoryId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.storeCategoryImage.deleteMany({
    where: { categoryId: params.categoryId },
  });

  await prisma.storeCategory.delete({
    where: { id: params.categoryId },
  });

  return NextResponse.json({ success: true });
}
