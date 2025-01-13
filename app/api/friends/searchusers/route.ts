import { NextRequest, NextResponse } from "next/server";
import {query} from '@/lib/database'
export async function GET(req: NextRequest) {
    const searchQuery = req.nextUrl.searchParams.get('query');

    try {
        let sqlQuery = 'SELECT * FROM public."Users"';
        const sqlParams: any[] = [];
        if (searchQuery) {
            sqlQuery += ` WHERE LOWER("username") LIKE $1 ORDER BY "username" ASC`;
            sqlParams.push(`%${searchQuery.toString().toLowerCase()}%`);
        }

        const result = await query(sqlQuery, sqlParams);
        const users = result.rows

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching movies:', error);
        return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
    }
}