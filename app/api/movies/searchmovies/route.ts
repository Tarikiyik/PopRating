import { NextRequest, NextResponse } from "next/server";
import {query} from '@/lib/database'
export async function GET(req: NextRequest) {
    const searchQuery = req.nextUrl.searchParams.get('query');
    
    try {
        let sqlQuery = 'SELECT * FROM public.movies';
        const sqlParams: any[] = [];
        if (searchQuery) {
            sqlQuery += ` WHERE LOWER("movieName") LIKE $1 ORDER BY "movieName" ASC`;
            sqlParams.push(`%${searchQuery.toString().toLowerCase()}%`);
        }

        const result = await query(sqlQuery, sqlParams);
        const movies = result.rows

        return NextResponse.json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        return NextResponse.json({ message: 'Error fetching movies' }, { status: 500 });
    }
}