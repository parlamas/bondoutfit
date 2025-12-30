// src/app/api/upload/store-item-image/route.ts

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Invalid file" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<{ secure_url: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "store-items" },
          (error, result) => {
            if (error || !result) reject(error);
            else resolve(result as any);
          }
        )
        .end(buffer);
    }
  );

  return NextResponse.json({
    url: result.secure_url,
  });
}

