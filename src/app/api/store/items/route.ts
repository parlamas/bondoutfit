// src/app/api/store/items/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { isDemoUser } from '@/lib/demo';

// GET /api/store/items - Get all items for the store
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'STORE_MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find the store managed by this user
    const store = await prisma.store.findUnique({
      where: { managerId: session.user.id },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const items = await prisma.storeItem.findMany({
      where: { storeId: store.id },
      include: {
        images: {
          select: {
            imageUrl: true,
            thumbnailUrl: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/store/items - Create a new item
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'STORE_MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const store = await prisma.store.findUnique({
      where: { managerId: session.user.id },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      sku,
      category,
      subcategory,
      description,
      brand,
      color,
      size,
      price,
      comparePrice,
      costPrice,
      currency,
      isTaxIncluded,
      taxRate,
      stockQuantity,
      lowStockThreshold,
      isInStock,
      allowBackorder,
      weight,
      dimensions,
      visible,
      featured,
      isNew,
      isOnSale,
      images,
    } = body;

    // Demo accounts: simulate a successful creation without writing to the database
    if (isDemoUser(session)) {
      return NextResponse.json({
        item: {
          id: `demo-${Date.now()}`,
          storeId: store.id,
          name,
          sku,
          category,
          subcategory,
          description,
          brand,
          color,
          size,
          price: price ? Math.round(price * 100) : null,
          comparePrice: comparePrice ? Math.round(comparePrice * 100) : null,
          costPrice: costPrice ? Math.round(costPrice * 100) : null,
          currency: currency || 'EUR',
          isTaxIncluded: isTaxIncluded ?? true,
          taxRate: taxRate || 0,
          stockQuantity: stockQuantity || 0,
          lowStockThreshold: lowStockThreshold || 10,
          isInStock: isInStock ?? true,
          allowBackorder: allowBackorder ?? false,
          weight,
          dimensions: dimensions ?? null,
          visible: visible ?? true,
          featured: featured ?? false,
          isNew: isNew ?? false,
          isOnSale: isOnSale ?? false,
          images: images ?? [],
        },
      }, { status: 201 });
    }

    const item = await prisma.storeItem.create({
      data: {
        storeId: store.id,
        name,
        sku,
        category,
        subcategory,
        description,
        brand,
        color,
        size,
        price: price ? Math.round(price * 100) : null, // Store in cents
        comparePrice: comparePrice ? Math.round(comparePrice * 100) : null,
        costPrice: costPrice ? Math.round(costPrice * 100) : null,
        currency: currency || 'EUR',
        isTaxIncluded: isTaxIncluded ?? true,
        taxRate: taxRate || 0,
        stockQuantity: stockQuantity || 0,
        lowStockThreshold: lowStockThreshold || 10,
        isInStock: isInStock ?? true,
        allowBackorder: allowBackorder ?? false,
        weight,
        dimensions: dimensions ? JSON.parse(JSON.stringify(dimensions)) : null,
        visible: visible ?? true,
        featured: featured ?? false,
        isNew: isNew ?? false,
        isOnSale: isOnSale ?? false,
        images: images ? {
          create: images.map((img: any, index: number) => ({
            imageUrl: img.imageUrl,
            thumbnailUrl: img.thumbnailUrl,
            order: index,
            altText: img.altText,
            caption: img.caption,
          })),
        } : undefined,
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}