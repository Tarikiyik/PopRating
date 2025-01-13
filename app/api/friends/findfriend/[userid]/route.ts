import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import bcrypt from "bcrypt";


interface ParamsType {
    userid: string;
}

export async function GET(req: NextRequest, { params }: { params: ParamsType }) {
    const userid = params?.userid;
    console.log('Request URL:', req.url);
    console.log('Extracted Name:', userid);

    if (!userid) {
        return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    try {
        const result = await query('SELECT * FROM public."Users" WHERE userid = $1', [userid]);
        if (result.rows.length === 0) {
            return NextResponse.json({ error: `User with ${userid} not found` }, { status: 404 });
        } else {
            return NextResponse.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

