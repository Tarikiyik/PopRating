import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { auth } from "@/auth";
import { query } from '@/lib/database'

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session?.user?.userid; 

        const formData = await request.formData();
        const file = formData.get('myImage') as File;
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const fileName = `${userId}_${file.name}`;
        const filePath = path.join(process.cwd(), "public/images/profilepictures", fileName);

        const dir = path.join(process.cwd(), "public/images/profilepictures");
        const files = await fs.readdir(dir);
        const userFiles = files.filter(f => f.startsWith(`${userId}_`));
        for (const userFile of userFiles) {
            await fs.unlink(path.join(dir, userFile));
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await fs.mkdir(path.dirname(filePath), { recursive: true });

        await fs.writeFile(filePath, buffer);
        
        await query('UPDATE public."Users" SET userpic = $1 WHERE userid = $2', [fileName,userId])

        return NextResponse.json({ success: "Image successfully saved", url: `/images/profilepictures/${fileName}`,name: fileName });
    } catch (error) {
        console.error("Failed to save image:", error);
        return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
    }
}