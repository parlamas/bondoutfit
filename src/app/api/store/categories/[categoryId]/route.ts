//src/app/api/store/categories/[categoryId]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { isDemoUser } from "@/lib/demo";

export async function DELETE(
  _: Request,
  { params }: { params: { categoryId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Demo accounts: simulate a successful deletion without writing to the database
  if (isDemoUser(session)) {
    return NextResponse.json({ success: true });
  }

  await prisma.storeCategoryImage.deleteMany({
    where: { categoryId: params.categoryId },
  });

  await prisma.storeCategory.delete({
    where: { id: params.categoryId },
  });

  return NextResponse.json({ success: true });
}
