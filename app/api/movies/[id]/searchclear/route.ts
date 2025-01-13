import { NextRequest, NextResponse } from "next/server";
import { query } from '@/lib/database';



export async function POST(req: NextRequest, { params }: { params: { id: string;} }) {
    const { id } = params;


    try {
        const result = await query(
            'UPDATE public.movies SET prequel = $1, sequel=$2 WHERE "movieId" = $3', [null,null, id]
        );
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Movie not found" }, { status: 404 });
        }
        return NextResponse.json({ message: 'cleared successfully' });
    } catch (error) {
        console.log({ error });
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

