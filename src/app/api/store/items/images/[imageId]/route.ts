//src/app/api/store/items/images/[imageId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { isDemoUser } from '@/lib/demo';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'STORE_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const image = await prisma.storeItemImage.findUnique({
      where: { id: params.imageId },
      include: { storeItem: { include: { store: true } } }
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Verify this image belongs to the manager's store
    const store = await prisma.store.findUnique({
      where: { managerId: session.user.id }
    });

    if (!store || image.storeItem.storeId !== store.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Demo accounts: simulate a successful deletion without touching Cloudinary or the database
    if (isDemoUser(session)) {
      return NextResponse.json({ success: true });
    }

    // Extract public_id from Cloudinary URL
    const urlParts = image.imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `bondoutfit/items/${image.storeItemId}/${filename.split('.')[0]}`;

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
    }

    // Delete from database
    await prisma.storeItemImage.delete({
      where: { id: params.imageId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}