// src/app/api/store/visits/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if ((session.user as any).role !== "STORE_MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const storeManagerId = (session.user as any).id;

  const visits = await prisma.visit.findMany({
    where: {
      store: {
        managerId: storeManagerId,
      },
    },
    orderBy: {
      scheduledDate: "asc",
    },
    include: {
      user: {
        select: {
          name: true,
          gender: true,
          age: true,
          heightCm: true,
          weightKg: true,
        },
      },
      store: {
        select: {
          name: true,
        },
      },
    },
  });

  return NextResponse.json(
    visits.map(v => ({
      id: v.id,
      scheduledDate: v.scheduledDate.toISOString().slice(0, 10),
      scheduledTime: v.scheduledTime,
      status: v.status,
      store: {
        name: v.store.name,
      },
      customer: {
        name: v.user.name,
        gender: v.user.gender,
        age: v.user.age,
        heightCm: v.user.heightCm,
        weightKg: v.user.weightKg,
      },
    }))
  );
}
