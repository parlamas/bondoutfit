// src/app/api/stores/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        country: true,
        city: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error("GET /api/stores error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
