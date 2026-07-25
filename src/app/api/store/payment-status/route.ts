import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDemoUser } from "@/lib/demo";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "STORE_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Demo account: always let them in, regardless of actual payment status.
  if (isDemoUser(session)) {
    return NextResponse.json({ paymentStatus: "active" });
  }

  const store = await prisma.store.findUnique({
    where: { managerId: (session.user as any).id },
    select: { paymentStatus: true },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json({ paymentStatus: store.paymentStatus });
}