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
    return NextResponse.json([], { status: 401 });
  }

  const store = await prisma.store.findUnique({
    where: { managerId: (session.user as any).id },
  });

  if (!store) {
    return NextResponse.json([]);
  }

  const images = await prisma.storeImage.findMany({
    where: {
      storeId: store.id,
      status: "ACTIVE",
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(images);
}


/**
 * POST → add store image (URL already uploaded, e.g. Cloudinary)
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "STORE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageUrl, type } = await req.json();

  if (!imageUrl || !type) {
    return NextResponse.json(
      { error: "imageUrl and type are required" },
      { status: 400 }
    );
  }

  const store = await prisma.store.findUnique({
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
      type,
    },
  });

  return NextResponse.json(image);
}

