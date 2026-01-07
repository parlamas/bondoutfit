// app/api/store/images/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { authOptions } from '@/lib/auth'; // CHANGED

// Configure Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('Cloudinary environment variables not set');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "STORE_MANAGER") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}


  try {
    const { description } = await req.json();
    
    // Find the store for this user
    const store = await prisma.store.findUnique({
  where: { managerId: (session.user as any).id },
});


    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Update only if image belongs to user's store
    const image = await prisma.storeImage.updateMany({
      where: { 
        id: params.id,
        storeId: store.id // Security check
      },
      data: { description },
    });

    if (image.count === 0) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  

  if (!session || (session.user as any).role !== "STORE_MANAGER") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}


  try {
    // Find the store for this user
    const store = await prisma.store.findUnique({
  where: { managerId: (session.user as any).id },
});


    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Find the image (check ownership)
    const image = await prisma.storeImage.findFirst({
      where: { 
        id: params.id,
        storeId: store.id // Security check
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete from Cloudinary first
    if (image?.imageUrl) {
      const matches = image.imageUrl.match(/upload\/(?:v\d+\/)?(.+)\./);
const publicId = matches?.[1];

if (publicId) {
  await cloudinary.uploader.destroy(publicId);
}

    }

    // Delete from database
    await prisma.storeImage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}