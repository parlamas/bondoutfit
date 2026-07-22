//src/app/api/store/items/images/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { isDemoUser } from '@/lib/demo';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'STORE_MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const itemId = formData.get('itemId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Verify item exists and belongs to this store manager
    const item = await prisma.storeItem.findUnique({
      where: { id: itemId },
      include: { store: true }
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Verify this item belongs to the manager's store
    const store = await prisma.store.findUnique({
      where: { managerId: session.user.id }
    });

    if (!store || item.storeId !== store.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Demo accounts: simulate a successful upload without hitting Cloudinary or the database
    if (isDemoUser(session)) {
      const simulatedImages = files.map((file, i) => ({
        id: `demo-${Date.now()}-${i}`,
        imageUrl: "https://placehold.co/400x300?text=Demo+Image",
        order: i,
        storeItemId: itemId,
      }));
      return NextResponse.json({
        ...item,
        images: simulatedImages,
      });
    }

    // Get current max order
    const existingImages = await prisma.storeItemImage.findMany({
      where: { storeItemId: itemId },
      orderBy: { order: 'asc' }
    });
    
    let nextOrder = existingImages.length;

    const uploadedImages = [];

    for (const file of files) {
      try {
        // Convert file to base64 for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: `bondoutfit/items/${itemId}`,
          public_id: `${Date.now()}-${file.name.split('.')[0]}`,
          resource_type: 'auto',
        });

        // Create database record
        const image = await prisma.storeItemImage.create({
          data: {
            imageUrl: result.secure_url,
            order: nextOrder++,
            storeItemId: itemId
          }
        });

        uploadedImages.push(image);
        
      } catch (fileError) {
        console.error('Error processing file:', file.name, fileError);
      }
    }

    // Fetch the updated item with all images
    const updatedItem = await prisma.storeItem.findUnique({
      where: { id: itemId },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json(updatedItem);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}