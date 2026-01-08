//src/app/api/store/categories/save/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { categories } = await req.json();

  for (const category of categories) {
    for (let i = 0; i < category.images.length; i++) {
      const image = category.images[i];

      await prisma.storeCategoryImage.updateMany({
  where: { id: image.id },
  data: {
    order: i,
    description: image.description,
  },
});

    }
  }

  return NextResponse.json({ ok: true });
}

