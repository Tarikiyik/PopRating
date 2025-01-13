import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('myImage') as File;
        const movieId = formData.get('movieId') as string;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const fileName = `${Date.now()}_${file.name}`;
        const filePath = path.join(process.cwd(), "public/images/homeslider_banners", fileName);

        const dir = path.join(process.cwd(), "public/images/homeslider_banners");
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await fs.writeFile(filePath, buffer);

        await query('UPDATE public."movies" SET "movieCarousel" = $1 WHERE "movieId" = $2', [fileName, movieId]);

        return NextResponse.json({ success: "Image successfully saved", url: `/images/homeslider_banners/${fileName}`, name: fileName });
    } catch (error) {
        console.error("Failed to save image:", error);
        return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
    }
}