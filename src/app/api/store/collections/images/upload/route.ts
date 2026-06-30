//src/app/api/store/collections/images/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

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
    const collectionId = formData.get('collectionId') as string;

    console.log('Upload started for collection:', collectionId);
    console.log('Files received:', files.length);

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    if (!collectionId) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    // Verify collection exists and belongs to this store manager
    const collection = await prisma.storeCollection.findUnique({
      where: { id: collectionId },
      include: { store: true }
    });

    if (!collection) {
      console.error('Collection not found:', collectionId);
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Verify this collection belongs to the manager's store
    const store = await prisma.store.findUnique({
      where: { managerId: session.user.id }
    });

    if (!store || collection.storeId !== store.id) {
      console.error('Unauthorized: store mismatch');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get current max order
    const existingImages = await prisma.collectionImage.findMany({
      where: { collectionId },
      orderBy: { order: 'asc' }
    });
    
    let nextOrder = existingImages.length;
    console.log('Current image count:', existingImages.length, 'Next order:', nextOrder);

    const uploadedImages = [];

    for (const file of files) {
      try {
        console.log('Processing file:', file.name, 'Size:', file.size);

        // Convert file to base64 for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: `bondoutfit/collections/${collectionId}`,
          public_id: `${Date.now()}-${file.name.split('.')[0]}`,
          resource_type: 'auto',
        });

        console.log('File uploaded to Cloudinary:', result.secure_url);

        // Create database record with the Cloudinary URL
        const image = await prisma.collectionImage.create({
          data: {
            url: result.secure_url,
            description: '', // Required field
            order: nextOrder++,
            collectionId
          }
        });

        console.log('Database record created:', image.id);
        uploadedImages.push(image);
        
      } catch (fileError) {
        console.error('Error processing file:', file.name, fileError);
        // Continue with other files even if one fails
      }
    }

    console.log('Total images uploaded successfully:', uploadedImages.length);

    // Fetch the updated collection with all images
    const updatedCollection = await prisma.storeCollection.findUnique({
      where: { id: collectionId },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });

    console.log('Final collection image count:', updatedCollection?.images.length || 0);
    
    return NextResponse.json(updatedCollection);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}