//src/app/api/visits/use-discount/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { visitId } = await req.json();

  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
  });

  if (!visit) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  if (visit.userId !== (session.user as any).id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!visit.discountUnlocked) {
    return NextResponse.json({ error: "Discount not unlocked" }, { status: 400 });
  }

  if (visit.discountUsed) {
    return NextResponse.json({ error: "Discount already used" }, { status: 400 });
  }

  await prisma.visit.update({
    where: { id: visitId },
    data: { discountUsed: true },
  });

  return NextResponse.json({ success: true });
}
