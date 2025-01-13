import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/auth";
import {query} from "@/lib/database";

interface ParamsType {
    movieId: string;
}

export async function GET(req: NextRequest, { params }: { params: ParamsType }) {
    const movieid = params?.movieId;
    const session = await auth();


    if (!movieid) {
        return NextResponse.json({ error: 'Invalid movie id' }, { status: 400 });
    }
    try {
        const result = await query('SELECT "movieName" FROM public.movies WHERE "movieId"=$1', [movieid]);
    if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Movie not found' }, { status: 403 });
    }
    const movie = result.rows[0];

        return NextResponse.json({ movie });
    } catch (error) {
        console.error('Error: ', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}