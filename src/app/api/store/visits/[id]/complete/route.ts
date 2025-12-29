// src/app/api/store/visits/[id]/complete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "STORE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const visitId = params.id;

  await prisma.visit.update({
    where: { id: visitId },
    data: {
      status: "COMPLETED",
      discountUnlocked: true,
      actualVisit: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
