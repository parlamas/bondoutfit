// src/app/api/store/items/images/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "STORE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { storeItemId, imageUrl } = body;

  if (!storeItemId || !imageUrl) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const image = await prisma.storeItemImage.create({
    data: {
      storeItemId,
      imageUrl,
    },
  });

  return NextResponse.json(image);
}
