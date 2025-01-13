import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import bcrypt from "bcrypt";
import { auth } from '@/auth'


interface ParamsType {
    username: string;
}

export async function GET(req: NextRequest, { params }: { params: ParamsType }) {
    const username = params?.username;
    const session = await auth();


    if (!username) {
        return NextResponse.json({ error: 'Invalid user name' }, { status: 400 });
    }

    const { rows: userRows } = await query('SELECT userid FROM public."Users" WHERE username=$1', [username]);
    if (userRows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 403 });
    }
    const userid = userRows[0].userid;

    const sessionuserid = session?.user?.userid

    try {

        const result = await query('SELECT status FROM public.friend WHERE ("userId1"=$1 AND "userId2"=$2) OR ("userId1"=$2 AND "userId2"=$1)', [userid, sessionuserid]);
        if (result.rows.length > 0) {
            const friendshipStatus = result.rows[0].status;

            if (friendshipStatus === true) {
                return NextResponse.json({ success: true, message: 'You are already CineMates!' });
            } 
            else if (friendshipStatus === false) {
                return NextResponse.json({ success: false, message: 'Friend request is pending' });
            } 
        } else {
            return NextResponse.json({ success: false });
        }
    } catch (error) {
        console.error('Error: ', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}



export async function POST(req: NextRequest, { params }: { params: ParamsType }) {
    const username = params?.username;
    const session = await auth();

    if (!username) {
        return NextResponse.json({ error: 'Invalid user name' }, { status: 400 });
    }

    const { rows: userRows } = await query('SELECT userid FROM public."Users" WHERE username=$1', [username]);
    if (userRows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 403 });
    }
    const userid = userRows[0].userid;

    const sessionuserid = session?.user?.userid;

    try {
        const resultCheck = await query(
            'SELECT status FROM public.friend WHERE ("userId1" = $1 AND "userId2" = $2) OR ("userId1" = $2 AND "userId2" = $1)',
            [userid, sessionuserid]
        );

        if (resultCheck.rows.length === 0) {
            const result = await query(
                'INSERT INTO public.friend ("userId1", "userId2", status) VALUES ($1, $2, false)',
                [userid, sessionuserid]
            );
            return NextResponse.json({ message: 'Friend request sent' });
        } else {
            const currentStatus = resultCheck.rows[0].status;
            if (currentStatus === false) {
                await query(
                    'UPDATE public.friend SET status = true WHERE ("userId1" = $1 AND "userId2" = $2) OR ("userId1" = $2 AND "userId2" = $1)',
                    [userid, sessionuserid]
                );
                return NextResponse.json({ message: 'Friend request accepted' });
            } else {
                return NextResponse.json({ error: 'Friend request already accepted' }, { status: 405 });
            }
        }
    } catch (error) {
        console.error('Error handling friend request', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest, { params }: { params: ParamsType }) {
    const username = params?.username;
    const session = await auth();


    if (!username) {
        return NextResponse.json({ error: 'Invalid user name' }, { status: 400 });
    }

    const { rows: userRows } = await query('SELECT userid FROM public."Users" WHERE username=$1', [username]);
    if (userRows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 403 });
    }
    const userid = userRows[0].userid;

    const sessionuserid = session?.user?.userid

    try {
        const resultCheck = await query('SELECT * FROM public.friend WHERE ("userId1" = $1 AND "userId2" = $2) OR ("userId1" = $2 AND "userId2" = $1)', [userid, sessionuserid]);
        if(resultCheck.rows.length > 0){
            const result = await query('DELETE FROM public.friend WHERE ("userId1" = $1 AND "userId2" = $2) OR ("userId1" = $2 AND "userId2" = $1)',[userid,sessionuserid]);
            return NextResponse.json({message: 'Successfully removed the request'});
        }
        else{
            return NextResponse.json({ error: `remove error` }, { status: 405 });
        }
    } catch (error) {
        console.error('Error sending request', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
