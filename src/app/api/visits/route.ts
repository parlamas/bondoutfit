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
              storeName: true,
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
      store: v.discount?.store
        ? {
            id: v.discount.store.id,
            name: v.discount.store.storeName,
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
    const { storeId, scheduledDate, scheduledTime, numberOfPeople, discountId } = body;

    if (!storeId || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        manager: {
          select: {
            email: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    const customer = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        email: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const visit = await prisma.visit.create({
      data: {
        userId: (session.user as any).id,
        storeId,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        numberOfPeople: numberOfPeople || 1,
        discountId: discountId || null,
        status: "SCHEDULED",
      },
      include: {
        store: {
          select: {
            storeName: true,
            street: true,
            streetNumber: true,
            city: true,
            country: true,
          },
        },
        discount: {
          select: {
            title: true,
            discountPercent: true,
            discountAmount: true,
          },
        },
      },
    });

    let qrCodeDataUrl = null;
    try {
      const QRCode = (await import('qrcode')).default;
      qrCodeDataUrl = await QRCode.toDataURL(visit.id);
      
      await prisma.visit.update({
        where: { id: visit.id },
        data: { qrCodeData: qrCodeDataUrl },
      });
    } catch (qrError) {
      console.error("Failed to generate QR code:", qrError);
    }

    if (process.env.RESEND_API_KEY && customer.email) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const customerName = customer.firstName + (customer.lastName ? ' ' + customer.lastName : '') || 'there';
        
        await resend.emails.send({
          from: 'BondOutfit <notifications@bondoutfit.com>',
          to: customer.email,
          subject: `✅ Visit Confirmed: ${visit.store.storeName}`,
          html: `
            <h2>Your Visit is Confirmed</h2>
            <p>Hi ${customerName},</p>
            <p>Your visit to <strong>${visit.store.storeName}</strong> is scheduled for:</p>
            <p><strong>${new Date(visit.scheduledDate).toLocaleDateString()} at ${visit.scheduledTime}</strong></p>
            <p>Address: ${visit.store.street} ${visit.store.streetNumber}, ${visit.store.city}</p>
            ${visit.discount ? `<p>Discount: ${visit.discount.title}</p>` : ''}
            ${qrCodeDataUrl ? `
              <p><strong>Your Check-in QR Code:</strong></p>
              <img src="${qrCodeDataUrl}" alt="QR Code for check-in" style="width: 200px; height: 200px;"/>
              <p>Show this QR code at the store to check in and redeem your discount.</p>
            ` : ''}
            <p>View visit details: https://www.bondoutfit.com/visits/${visit.id}</p>
          `,
        });
        console.log(`✅ Email sent to customer: ${customer.email}`);
      } catch (emailError) {
        console.error("❌ Failed to send customer email:", emailError);
      }
    }

    if (process.env.RESEND_API_KEY && store.manager?.email) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const customerName = customer.firstName + (customer.lastName ? ' ' + customer.lastName : '') || 'Customer';
        const managerName = store.manager.firstName + (store.manager.lastName ? ' ' + store.manager.lastName : '') || 'Manager';
        
        await resend.emails.send({
          from: 'BondOutfit <notifications@bondoutfit.com>',
          to: store.manager.email,
          subject: `📅 New Visit Scheduled: ${customerName}`,
          html: `
            <h2>New Visit Scheduled</h2>
            <p>Hi ${managerName},</p>
            <p>A customer has scheduled a visit to your store:</p>
            <ul>
              <li><strong>Customer:</strong> ${customerName}</li>
              <li><strong>Date & Time:</strong> ${new Date(visit.scheduledDate).toLocaleDateString()} at ${visit.scheduledTime}</li>
              <li><strong>Party Size:</strong> ${visit.numberOfPeople} person(s)</li>
              ${visit.discount ? `<li><strong>Discount:</strong> ${visit.discount.title}</li>` : ''}
            </ul>
            ${qrCodeDataUrl ? `
              <p><strong>Customer's Check-in QR Code:</strong></p>
              <img src="${qrCodeDataUrl}" alt="QR Code for check-in" style="width: 200px; height: 200px;"/>
            ` : ''}
            <p>Visit ID: ${visit.id}</p>
          `,
        });
        console.log(`✅ Email sent to store manager: ${store.manager.email}`);
      } catch (emailError) {
        console.error("❌ Failed to send manager email:", emailError);
      }
    }

    return NextResponse.json({
      id: visit.id,
      scheduledDate: visit.scheduledDate.toISOString(),
      scheduledTime: visit.scheduledTime,
      numberOfPeople: visit.numberOfPeople,
      status: visit.status,
      store: visit.store,
      discount: visit.discount,
      qrCodeGenerated: !!qrCodeDataUrl,
    });
  } catch (error) {
    console.error("❌ Error creating visit:", error);
    return NextResponse.json(
      { error: "Failed to create visit" },
      { status: 500 }
    );
  }
}