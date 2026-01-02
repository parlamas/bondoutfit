// src/app/api/store/images/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET → list store images
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "STORE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await prisma.store.findFirst({
    where: { managerId: (session.user as any).id },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!store) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(store.images);
}

/**
 * POST → add store image (URL already uploaded, e.g. Cloudinary)
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "STORE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageUrl, order = 0 } = await req.json();

  if (!imageUrl) {
    return NextResponse.json(
      { error: "imageUrl required" },
      { status: 400 }
    );
  }

  const store = await prisma.store.findFirst({
    where: { managerId: (session.user as any).id },
  });

  if (!store) {
    return NextResponse.json(
      { error: "Store not found" },
      { status: 404 }
    );
  }

  const image = await prisma.storeImage.create({
  data: {
    storeId: store.id,
    imageUrl,
    order,
    type: "GALLERY",
  },
});

  return NextResponse.json(image);
}
