//src/app/api/stores/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const stores = await prisma.user.findMany({
      where: {
        role: "STORE_MANAGER",
        storeName: {
          not: null,
        },
      },
      select: {
        id: true,
        storeName: true,
        country: true,
        city: true,
      },
    });

    const result = stores.map((s) => ({
      id: s.id,
      name: s.storeName!,
      country: s.country ?? "Unknown",
      city: s.city ?? "Unknown",
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/stores error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

