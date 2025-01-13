import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
    const session = await auth();

    const userid = session?.user?.userid;

    try {
        const result = await query('SELECT * FROM public."favouriteMovies" WHERE userid=$1', [userid]);
        
        if (result.rowCount === 0) {
            return NextResponse.json({ movies: [], success: true });
        }

        return NextResponse.json({ movies: result.rows, success: true });
    } catch (error) {
        console.log({ error });
        return NextResponse.json({ message: 'Internal server error', success: false }, { status: 500 });
    }
}