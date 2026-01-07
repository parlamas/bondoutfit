//src/app/api/store/categories/[categoryId]/images/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const category = await prisma.storeCategory.findUnique({
    where: { id: params.categoryId },
    include: { store: true },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  if (
    category.store.email !== session.user.email &&
    category.store.managerId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const description = formData.get("description") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const upload = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `stores/${category.storeId}/categories/${category.id}`,
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    ).end(buffer);
  });

  const last = await prisma.storeCategoryImage.findFirst({
    where: { categoryId: category.id },
    orderBy: { order: "desc" },
  });

  const image = await prisma.storeCategoryImage.create({
    data: {
      categoryId: category.id,
      imageUrl: upload.secure_url,
      description,
      order: last ? last.order + 1 : 0,
    },
  });

  return NextResponse.json(image);
}
