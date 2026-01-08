//src/app/api/store/categories/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/* GET all categories for current store */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { email: session.user.email },
        { manager: { email: session.user.email } },
      ],
    },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const categories = await prisma.storeCategory.findMany({
    where: { storeId: store.id },
    orderBy: { order: "asc" },
    include: {
  images: {
    orderBy: { order: "asc" },
  },
},
  });

  return NextResponse.json(categories);
}

/* CREATE category */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { email: session.user.email },
        { manager: { email: session.user.email } },
      ],
    },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const last = await prisma.storeCategory.findFirst({
    where: { storeId: store.id },
    orderBy: { order: "desc" },
  });

  const category = await prisma.storeCategory.create({
    data: {
      storeId: store.id,
      title: title.trim(),
      order: last ? last.order + 1 : 0,
    },
  });

  return NextResponse.json(category);
}
