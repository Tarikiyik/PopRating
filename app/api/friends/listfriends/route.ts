import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { auth } from '@/auth'




export async function GET(req: NextRequest) {
    const session = await auth();
    const sessionuserid = session?.user?.userid

    try {

        const result = await query('SELECT * FROM public.friend WHERE "userId1"=$1 OR "userId2"=$1', [sessionuserid]);
        const friends = result.rows.filter(row => row.status === true);
        const friendRequests = result.rows.filter(row => row.status === false && row.userId1 === sessionuserid);

        const result2 = await query(`
        SELECT fm.*
            FROM public."followedMovies" fm
            JOIN public."friend" f 
            ON (f."userId1" = fm."userId" OR f."userId2" = fm."userId")
            WHERE (f."userId1" = $1 OR f."userId2" = $1)
            AND f."status" = true
            AND fm."userId" != $1
            ORDER BY fm."followId" DESC
        LIMIT 10
`, [sessionuserid]);
        return NextResponse.json({ friends, friendRequests, followedMovies: result2.rows });

    }
     catch (error) {
        console.error('Error: ', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    const session = await auth();
    const sessionuserid = session?.user?.userid

    try {

        const result = await query(
            
            'UPDATE public.friend SET status = true WHERE "userId1"=$1 OR "userId2"=$1',
            [sessionuserid]
        );        return NextResponse.json(result.rows);
    }
    catch (error) { 
        console.error('Error: ', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await auth();
    const sessionuserid = session?.user?.userid
    

    try {

        const result = await query('SELECT * FROM public.friend WHERE "userId1"=$1 OR "userId2"=$1', [sessionuserid]);
        return NextResponse.json(result.rows);
    }
    catch (error) {
        console.error('Error: ', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

