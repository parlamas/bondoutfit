//src/app/api/store/items/[id]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/store/items/[id] - Get a specific item
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const item = await prisma.storeItem.findFirst({
      where: {
        id: params.id,
        storeId: store.id,
      },
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Convert cents back to euros for response
    const formattedItem = {
      ...item,
      price: item.price ? item.price / 100 : null,
      comparePrice: item.comparePrice ? item.comparePrice / 100 : null,
      costPrice: item.costPrice ? item.costPrice / 100 : null,
    };

    return NextResponse.json({ item: formattedItem });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/store/items/[id] - Update an item
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if item exists and belongs to this store
    const existingItem = await prisma.storeItem.findFirst({
      where: {
        id: params.id,
        storeId: store.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
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
    } = body;

    const item = await prisma.storeItem.update({
      where: { id: params.id },
      data: {
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
        currency,
        isTaxIncluded,
        taxRate,
        stockQuantity,
        lowStockThreshold,
        isInStock,
        allowBackorder,
        weight,
        dimensions: dimensions ? JSON.parse(JSON.stringify(dimensions)) : null,
        visible,
        featured,
        isNew,
        isOnSale,
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/store/items/[id] - Delete an item
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if item exists and belongs to this store
    const existingItem = await prisma.storeItem.findFirst({
      where: {
        id: params.id,
        storeId: store.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Delete the item (images will cascade delete)
    await prisma.storeItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}