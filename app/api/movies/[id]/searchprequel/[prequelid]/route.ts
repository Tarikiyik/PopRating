import { NextRequest, NextResponse } from "next/server";
import { query } from '@/lib/database';

export async function GET(req: NextRequest, { params }: { params: { id: string; prequelid: string } }) {
    const { id, prequelid } = params; 
    const prequelMovie = await query('SELECT * FROM public."movies" WHERE "movieId" = $1', [prequelid]);

    if (prequelMovie.rowCount === 0) {
        return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }
    return NextResponse.json(prequelMovie.rows[0]);
}

export async function POST(req: NextRequest, { params }: { params: { id: string; prequelid: string } }) {
    const { id, prequelid } = params; 
    

    try {
        const result = await query(
            'UPDATE public.movies SET prequel = $1 WHERE "movieId" = $2', [prequelid, id]
        );
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Movie not found" }, { status: 404 });
        }
        return NextResponse.json({ message: 'Prequel updated successfully' });
    } catch (error) {
        console.log({ error });
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

