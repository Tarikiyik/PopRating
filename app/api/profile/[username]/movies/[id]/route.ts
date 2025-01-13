import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { auth } from '@/auth'


interface ParamsType {
    id: string;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const session = await auth();
    const userid = session?.user?.userid;
    try {
        const result = await query('SELECT * FROM public."favouriteMovies" WHERE "userid"=$1', [userid]);
        if (result.rowCount === 0) {
            return NextResponse.json({ message: 'No favorite movies'});
        }
        return NextResponse.json({ message: 'Favorite movies' });
    } catch (error) {
        console.log({ error });
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const session = await auth();
    const userid = session?.user?.userid
    try {
        const result = await query('DELETE FROM public."followedMovies" WHERE "movieId" = $1 and "userId" = $2 RETURNING *', [id,userid]);
        const result2 = await query('DELETE FROM public.ratings WHERE "movieId" = $1 and "userId" = $2 RETURNING *', [id,userid]);
        const result3 = await query('DELETE FROM public."favouriteMovies" WHERE "movieId" = $1 and userid = $2 RETURNING *', [id,userid]);
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Movie not found" }, { status: 404 });
        }

        return NextResponse.json({ message: 'Movie removed successfully' });
    } catch (error) {
        console.log({ error });
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const session = await auth();
    const userid = session?.user?.userid
    try {
        
        let result
        const resultCheck = await query('SELECT * FROM public."favouriteMovies" WHERE "movieId"=$1 and userid=$2', [id, userid]);       
        if (resultCheck.rowCount === 0) {
            const result = await query('INSERT INTO public."favouriteMovies" ("movieId", "userid") VALUES ($1, $2)', [id, userid]);
        }
        else{
            const result = await query('DELETE FROM public."favouriteMovies" WHERE "movieId"=$1 and userid=$2',[id,userid])
        }
        
        return NextResponse.json({ message: 'Added favourite successfully' });
    } catch (error) {
        console.log({ error });
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}