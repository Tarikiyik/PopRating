import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import bcrypt from "bcrypt";


interface ParamsType {
    username: string; 
}

export async function GET(req: NextRequest, { params }: { params: ParamsType }) {
    const username = params?.username;
    console.log('Request URL:', req.url); 
    console.log('Extracted Name:', username); 

    if (!username) {
        return NextResponse.json({ error: 'Invalid user name' }, { status: 400 });
    }

    try {
        const result = await query('SELECT * FROM public."Users" WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return NextResponse.json({ error: `User with ${username} not found` }, { status: 404 });
        } else {
            return NextResponse.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest, { params }: { params: ParamsType }) {
    const username = params?.username;
    const { password } = await req.json();


    if (!username || !password) {
        return NextResponse.json({ error: 'Invalid user name or password' }, { status: 400 });
    }

    try {
        const userResult = await query('SELECT * FROM public."Users" WHERE username = $1', [username]);

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: `User with ${username} not found` }, { status: 404 });
        }

        const user = userResult.rows[0];

        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if (!isPasswordCorrect) {
            return NextResponse.json({ message: 'Incorrect password' }, { status: 401 });
        }

        await query('DELETE FROM public."Users" WHERE username = $1', [username]);

        return NextResponse.json({ message: 'Account successfully deleted' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting user profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}