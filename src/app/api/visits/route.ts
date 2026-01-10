// src/app/api/visits/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const visits = await prisma.visit.findMany({
    where: {
      userId,
    },
    orderBy: {
      scheduledDate: "desc",
    },
    include: {
      discount: {
        select: {
          title: true,
          discountPercent: true,
          discountAmount: true,
          store: {
            select: {
              id: true,
              name: true,
              city: true,
              country: true,
            },
          },
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
      discountUnlocked: v.discountUnlocked,
      discountUsed: v.discountUsed,
      discount: v.discount
        ? {
            title: v.discount.title,
            discountPercent: v.discount.discountPercent,
            discountAmount: v.discount.discountAmount,
          }
        : null,
      store: v.discount
        ? {
            id: v.discount.store.id,
            name: v.discount.store.name,
            city: v.discount.store.city,
            country: v.discount.store.country,
          }
        : null,
    }))
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId, scheduledDate, scheduledTime, numberOfPeople } = body;

    // Validate required fields
    if (!storeId || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // Create the visit
    const visit = await prisma.visit.create({
      data: {
        userId: (session.user as any).id,
        storeId,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        numberOfPeople: numberOfPeople || 1,
        status: "SCHEDULED",
      },
      include: {
        store: {
          select: {
            name: true,
            street: true,
            streetNumber: true,
            city: true,
            country: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: visit.id,
      scheduledDate: visit.scheduledDate.toISOString(),
      scheduledTime: visit.scheduledTime,
      numberOfPeople: visit.numberOfPeople,
      status: visit.status,
      store: visit.store,
    });
  } catch (error) {
    console.error("Error creating visit:", error);
    return NextResponse.json(
      { error: "Failed to create visit" },
      { status: 500 }
    );
  }
}