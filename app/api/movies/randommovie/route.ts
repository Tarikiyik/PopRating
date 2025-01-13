import { NextResponse } from "next/server";
import { query } from '@/lib/database';

export async function GET(req: Request, res: Response) {
    try {
        const randomMovieQuery = "SELECT * FROM public.movies ORDER BY RANDOM() LIMIT 1;";
        const result = await query(randomMovieQuery);

        if (result.rows.length > 0) {
            return NextResponse.json(result.rows[0]);
        } else {
            return NextResponse.json({ message: 'No movies found' });
        }
    } catch (error) {
        console.error('Error fetching random movie:', error);
        return NextResponse.json({ error: 'Failed to fetch random movie' });
    }
}