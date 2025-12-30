// src/app/api/store/items/route.ts

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

  const {
    name,
    category,
    description,
    price,
  } = body;

  if (!name || !category) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const store = await prisma.store.findFirst({
    where: {
      managerId: (session.user as any).id,
    },
  });

  if (!store) {
    return NextResponse.json(
      { error: "Store not found" },
      { status: 404 }
    );
  }

  const item = await prisma.storeItem.create({
    data: {
      storeId: store.id,
      name,
      category,
      description: description || null,
      price: price ?? null,
    },
  });

  return NextResponse.json(item);
}
