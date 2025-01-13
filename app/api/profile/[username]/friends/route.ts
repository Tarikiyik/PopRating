import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface ParamsType {
    username: string;
}


export async function GET(req: NextRequest, { params }: { params: ParamsType }) {
    const username = params?.username;
    console.log('username friend: ',username)


    const useridCheck = await query('SELECT userid FROM public."Users" WHERE username=$1', [username]);
    const userid = useridCheck.rows[0]?.userid; 
    console.log(userid);
    
    try {

        const result = await query('SELECT * FROM public.friend WHERE "userId1"=$1 OR "userId2"=$1', [userid]);
        const friends = result.rows.filter(row => row.status === true);
        
        const numfriends = friends.length
      
        return NextResponse.json({ friends,numfriends });

    }
    catch (error) {
        console.error('Error: ', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


