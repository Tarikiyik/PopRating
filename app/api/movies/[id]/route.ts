import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { query } from '@/lib/database';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const movie = await query('SELECT * FROM public."movies" WHERE "movieId" = $1', [id]);
    if (movie.rowCount === 0) {
        return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }
    return NextResponse.json(movie.rows[0]);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const formData = await req.formData();
        const movieName = formData.get('movie-name') as string;
        const type = formData.get('type') === 'true';
        const movieDesc = formData.get('movie-desc') as string;
        const genre = formData.get('genre') as string;
        const director = formData.get('director') as string | null;
        const releaseDate = formData.get('release-date') as string;
        const trailerUrl = formData.get('trailer-url') as string | null;
        const file = formData.get('myImage') as File | null;

        let movieBanner = null;

        if (file) {
            const fileName = `${Date.now()}_${file.name}`;
            const filePath = path.join(process.cwd(), "public/images/movie_banners", fileName);

            const dir = path.join(process.cwd(), "public/images/movie_banners");
            await fs.mkdir(path.dirname(filePath), { recursive: true });

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await fs.writeFile(filePath, buffer);

            movieBanner = fileName;
        }
        
        if (movieName.length > 40){
            return NextResponse.json({ message: 'The movie name can have a maximum of 40 characters.' }, { status: 400 });        }
        if (movieDesc.length > 255){
            return NextResponse.json({ message: 'The movie description can have a maximum of 255 characters.' }, { status: 400 });
        }
        if (director && director?.length > 255){
            return NextResponse.json({ message: 'The director name can have a maximum of 40 characters.' }, { status: 400 });
        }
        if (trailerUrl && trailerUrl?.length > 255){
            return NextResponse.json({ message: 'The trailer url can have a maximum of 255 characters.' }, { status: 400 });
        }

        const result = await query(
            'UPDATE public."movies" SET "movieName" = $1, type = $2, "movieDesc" = $3, genre = $4, director = $5, "releaseDate" = $6, "trailerUrl" = $7, "movieBanner" = COALESCE($8, "movieBanner") WHERE "movieId" = $9 RETURNING *',
            [movieName, type, movieDesc, genre, director, releaseDate, trailerUrl, movieBanner, id]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.log({ error });
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const movie = await query('SELECT "movieBanner" FROM public."movies" WHERE "movieId" = $1', [id]);
        if (movie.rowCount === 0) {
            return NextResponse.json({ error: "Movie not found" }, { status: 404 });
        }

        const movieBanner = movie.rows[0].movieBanner;
        if (movieBanner) {
            const filePath = path.join(process.cwd(), "public/images/movie_banners", movieBanner);
            await fs.unlink(filePath).catch(error => {
                console.error(`Failed to delete movie banner ${filePath}:`, error);
            });
        }

        const result = await query('DELETE FROM public."movies" WHERE "movieId" = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Movie not found" }, { status: 404 });
        }

        return NextResponse.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        console.log({ error });
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}