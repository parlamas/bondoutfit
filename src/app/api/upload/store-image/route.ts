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

  console.log('Upload API called by:', session.user.email);

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'logo' | 'storefront' | 'gallery';
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string | null;


    console.log('Upload request details:', { 
      type, 
      description, 
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type 
    });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `stores/${session.user?.email}/${type}`,
          resource_type: 'image',
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload successful:', result?.secure_url);
            resolve(result!);
          }
        }
      );
      uploadStream.end(buffer);
    });

    // Find store
    const store = await prisma.store.findFirst({
      where: { 
        OR: [
          { email: session.user.email },
          { manager: { email: session.user.email } }
        ]
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    console.log('Store found:', { id: store.id, storeName: store.storeName });

    // Determine image type for database
    const imageType = 
      type === "logo" ? "LOGO" : 
      type === "storefront" ? "STOREFRONT" : 
      "GALLERY";

    console.log('Processing as image type:', imageType);

    if (imageType === "LOGO" || imageType === "STOREFRONT") {
      // Handle logo and storefront images (single per store)
      const existing = await prisma.storeImage.findFirst({
        where: {
          storeId: store.id,
          type: imageType,
        },
      });

      const storeImage = existing
        ? await prisma.storeImage.update({
            where: { id: existing.id },
            data: {
              imageUrl: uploadResult.secure_url,
              status: "ACTIVE",
              updatedAt: new Date(),
            },
          })
        : await prisma.storeImage.create({
            data: {
              storeId: store.id,
              imageUrl: uploadResult.secure_url,
              type: imageType,
              order: 0,
              status: "ACTIVE",
              title: imageType === "LOGO" ? "Store Logo" : "Storefront",
              description: description || null,
            },
          });

      console.log('Logo/Storefront saved:', storeImage.id);
      return NextResponse.json({
        id: storeImage.id,
        url: storeImage.imageUrl,
      });
    }

    // Handle CATEGORY images
if (categoryId) {
  const lastCategoryImage = await prisma.storeCategoryImage.findFirst({
    where: { categoryId },
    orderBy: { order: 'desc' },
  });

  const nextOrder = lastCategoryImage ? lastCategoryImage.order + 1 : 0;

  const categoryImage = await prisma.storeCategoryImage.create({
    data: {
      categoryId,
      imageUrl: uploadResult.secure_url,
      order: nextOrder,
      description: description || null,
      status: 'ACTIVE',
    },
  });

  return NextResponse.json({
    id: categoryImage.id,
    url: categoryImage.imageUrl,
    description: categoryImage.description,
    order: categoryImage.order,
  });
}

// Handle GALLERY images (uncategorized only)
if (imageType === "GALLERY" && !categoryId) {
  const lastGalleryImage = await prisma.storeImage.findFirst({
    where: {
      storeId: store.id,
      type: "GALLERY",
    },
    orderBy: { order: "desc" },
  });

  const nextOrder = lastGalleryImage ? lastGalleryImage.order + 1 : 0;

  const storeImage = await prisma.storeImage.create({
    data: {
      storeId: store.id,
      imageUrl: uploadResult.secure_url,
      type: "GALLERY",
      order: nextOrder,
      status: "ACTIVE",
      title: description || "Gallery Image",
      description: description || null,
    },
  });

  return NextResponse.json({
    id: storeImage.id,
    url: storeImage.imageUrl,
    description: storeImage.description,
    order: storeImage.order,
  });
}

    
    return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });

  } catch (error) {
    console.error('Upload failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
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