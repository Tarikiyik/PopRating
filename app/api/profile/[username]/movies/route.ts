import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface ParamsType {
    username?: string;
    id?: string;
}

export async function GET(req: NextRequest, { params }: { params: ParamsType }) {
    const { username } = params;

    if (!username) {
        return NextResponse.json({ error: 'Invalid user name' }, { status: 400 });
    }

    try {
        const userResult = await query('SELECT userid FROM public."Users" WHERE username=$1', [username]);

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: `User not found for username ${username}` }, { status: 404 });
        }
        const userid = userResult.rows[0].userid;

        const movieResult = await query('SELECT "movieId" FROM public."followedMovies" WHERE "userId"=$1', [userid]);
        if (movieResult.rows.length === 0) {
            return NextResponse.json({ error: `No followed movies found for user ${username}` }, { status: 404 });
        }

        const movieIds = movieResult.rows.map(row => row.movieId);
        const followedMovies = await query('SELECT * FROM public.movies WHERE "movieId" = ANY($1)', [movieIds]);

        const favoriteMoviesCheck = await query('SELECT "movieId" FROM public."favouriteMovies" WHERE "userid"=$1', [userid]);
        const favoriteMovieIds = favoriteMoviesCheck.rows.map(row => row.movieId);

        let favoriteMoviesResult = { rows: [] } as any
        if (favoriteMovieIds.length > 0) {
            favoriteMoviesResult = await query('SELECT * FROM public.movies WHERE "movieId" = ANY($1)', [favoriteMovieIds]);
        }

        const response = {
            followedMovies: followedMovies.rows,
            favoriteMovies: favoriteMoviesResult.rows
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}