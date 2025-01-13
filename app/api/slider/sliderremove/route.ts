import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const movieId = formData.get('movieId') as string;


        if (!movieId) {
            return NextResponse.json({ error: "Movie ID is required" }, { status: 400 });
        }
        
        const movieResult = await query('SELECT "movieCarousel" FROM public."movies" WHERE "movieId"=$1',[movieId])

        if (movieResult.rows.length === 0) {
            return NextResponse.json({ error: "Movie not found" }, { status: 404 });
        }
        
        const imageName = movieResult.rows[0].movieCarousel
        const filePath = path.join(process.cwd(), "public/images/homeslider_banners",imageName)
        
        await fs.unlink(filePath)
        await query('UPDATE public."movies" SET "movieCarousel" = $1 WHERE "movieId"=$2',[null,movieId])
        

        return NextResponse.json({ success: "Image successfully deleted"});
    } catch (error) {
        console.error("Failed to delete image:", error);
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
}