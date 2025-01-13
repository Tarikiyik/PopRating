import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { query } from '@/lib/database';

export async function GET(){
    const movies = await query('SELECT * FROM public."movies"');
    return NextResponse.json(movies.rows);
}

export async function POST(req: NextRequest){
    try {
        const formData = await req.formData();

        const movieName = formData.get('movie-name') as string;
        const type = formData.get('type') === 'true';
        const movieDesc = formData.get('movie-desc') as string;
        const genre = formData.get('genre') as string;
        const director = formData.get('director') as string;
        const releaseDate = formData.get('release-date') as string;
        const trailerUrl = formData.get('trailer-url') as string;
        const file = formData.get('myImage') as File;

        if (!movieName || !movieDesc || !genre || !releaseDate) {
            return NextResponse.json({ message: 'All fields except Director and Trailer URL are required.' }, { status: 400 });
        }
        if (movieName.length > 40){
            return NextResponse.json({ message: 'The movie name can have a maximum of 40 characters.' }, { status: 400 });        }
        if (movieDesc.length > 255){
            return NextResponse.json({ message: 'The movie description can have a maximum of 255 characters.' }, { status: 400 });
        }
        if (director.length > 255){
            return NextResponse.json({ message: 'The director name can have a maximum of 40 characters.' }, { status: 400 });
        }
        if (trailerUrl.length > 255){
            return NextResponse.json({ message: 'The trailer url can have a maximum of 255 characters.' }, { status: 400 });
        }

        let movieBanner = null;

        if (file) {
            const fileName = `${Date.now()}_${file.name}`;
            const filePath = path.join(process.cwd(), "public/images/movie_banners", fileName);
            await fs.mkdir(path.dirname(filePath), { recursive: true });

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await fs.writeFile(filePath, buffer);

            movieBanner = fileName;
        }

        const result = await query(
            'INSERT INTO public."movies" ("movieName", type, "movieDesc", genre, director, "releaseDate", "trailerUrl", "movieBanner") VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [movieName, type, movieDesc, genre, director, releaseDate, trailerUrl, movieBanner]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.log({ error });
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}


