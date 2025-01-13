import { NextRequest, NextResponse } from "next/server";
import { query } from '@/lib/database';

export async function GET(req: NextRequest, { params }: { params: { id: string; sequelid: string } }) {
    const { id, sequelid } = params;
    const sequelMovie = await query('SELECT * FROM public."movies" WHERE "movieId" = $1', [sequelid]);

    if (sequelMovie.rowCount === 0) {
        return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }
    return NextResponse.json(sequelMovie.rows[0]);
}

export async function POST(req: NextRequest, { params }: { params: { id: string; sequelid: string } }) {
    const { id, sequelid } = params;

    try {
        const result = await query(
            'UPDATE public.movies SET sequel = $1 WHERE "movieId" = $2', [sequelid, id]
        );
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Movie not found" }, { status: 404 });
        }
        return NextResponse.json({ message: 'Sequel updated successfully' });
    } catch (error) {
        console.log({ error });
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

