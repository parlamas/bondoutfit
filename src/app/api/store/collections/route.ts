//src/app/api/store/collections/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "STORE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const store = await prisma.store.findUnique({
    where: { managerId: userId },
    include: {
      collections: {
        orderBy: { createdAt: "asc" },
        include: {
          images: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!store) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(store.collections);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "STORE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await request.json();

  if (!body.title || !body.title.trim()) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  const store = await prisma.store.findUnique({
    where: { managerId: userId },
  });

  if (!store) {
    return NextResponse.json(
      { error: "Store not found" },
      { status: 404 }
    );
  }

  const collection = await prisma.storeCollection.create({
    data: {
      storeId: store.id,
      title: body.title.trim(),
    },
  });

  return NextResponse.json(collection);
}

