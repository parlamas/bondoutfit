// app/api/store/upload-image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

// Configure Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('Cloudinary environment variables not set');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'logo' | 'storefront' | 'gallery';
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `stores/${session.user?.email}/${type}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Save to database
    const store = await prisma.store.findUnique({
      where: { email: session.user.email },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    if (type === 'logo') {
      const updatedStore = await prisma.store.update({
        where: { email: session.user.email },
        data: { logoUrl: uploadResult.secure_url },
      });
      
      return NextResponse.json({ 
        url: uploadResult.secure_url,
        store: updatedStore 
      });
    } else if (type === 'storefront') {
      const updatedStore = await prisma.store.update({
        where: { email: session.user.email },
        data: { storefrontUrl: uploadResult.secure_url },
      });
      
      return NextResponse.json({ 
        url: uploadResult.secure_url,
        store: updatedStore 
      });
    } else {
      // Get current gallery count for order
      const galleryCount = await prisma.storeImage.count({
        where: { 
          storeId: store.id,
          type: 'GALLERY' 
        },
      });

      const storeImage = await prisma.storeImage.create({
        data: {
          imageUrl: uploadResult.secure_url,
          description: description || '',
          type: 'GALLERY',
          order: galleryCount,
          storeId: store.id,
        },
      });

      return NextResponse.json({
        id: storeImage.id,
        url: storeImage.imageUrl,
      });
    }
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}