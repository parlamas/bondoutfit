// app/api/upload/store-image/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

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

  console.log('User email from session:', session.user.email);

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'logo' | 'storefront' | 'gallery';
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('Cloudinary config check:', {
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      fileInfo: { name: file.name, size: file.size, type: file.type }
    });
    
    // Upload to Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `stores/${session.user?.email}/${type}`,
          resource_type: 'image',
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) reject(error);
          else resolve(result!);
        }
      );
      uploadStream.end(buffer);
    });

    // Save to database
    const store = await prisma.store.findFirst({
      where: { 
        OR: [
          { email: session.user.email },
          { manager: { email: session.user.email } }
        ]
      },
    });

    console.log('Store found:', store ? { id: store.id, name: store.name } : 'No store found');

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const imageType =
  type === "logo"
    ? "LOGO"
    : type === "storefront"
    ? "STOREFRONT"
    : "GALLERY";

let storeImage;

if (imageType === "LOGO" || imageType === "STOREFRONT") {
  const existing = await prisma.storeImage.findFirst({
    where: {
      storeId: store.id,
      type: imageType,
    },
  });

  storeImage = existing
    ? await prisma.storeImage.update({
        where: { id: existing.id },
        data: {
          imageUrl: uploadResult.secure_url,
          status: "ACTIVE",
        },
      })
    : await prisma.storeImage.create({
        data: {
          storeId: store.id,
          imageUrl: uploadResult.secure_url,
          type: imageType,
          order: 0,
          status: "ACTIVE",
        },
      });
} else {
  const lastImage = await prisma.storeImage.findFirst({
    where: {
      storeId: store.id,
      type: "GALLERY",
    },
    orderBy: {
      order: "desc",
    },
  });

  storeImage = await prisma.storeImage.create({
  data: {
    storeId: store.id,
    categoryId: categoryId,
    imageUrl: uploadResult.secure_url,
    type: "GALLERY",
    order: lastImage ? lastImage.order + 1 : 0,
    status: "ACTIVE",
  },
});

}


return NextResponse.json({
  id: storeImage.id,
  url: storeImage.imageUrl,
});
 
  } catch (error) {
    console.error('Upload failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}