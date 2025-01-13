import { NextRequest, NextResponse } from "next/server";
import { query } from '@/lib/database';
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await auth();

    const { id } = params;
    const userId = session?.user?.userid;

    const result2 = await query('SELECT * FROM public."followedMovies" WHERE "userId" = $1 AND "movieId" = $2', [userId, id]);

    const result1 = await query('SELECT * FROM public."ratings" WHERE "userId" = $1 AND "movieId" = $2', [userId, id]);
    
    const followCountResult = await query('SELECT COUNT(*) AS follow_count FROM public."followedMovies" WHERE "movieId" = $1', [id])
    const followCount = followCountResult.rows[0]?.follow_count || 0
    
    const ratingCountResult = await query('SELECT COUNT(*) AS rating_count FROM public."ratings" WHERE "movieId" = $1',[id])
    const ratingCount = ratingCountResult.rows[0]?.rating_count || 0

    const ratingPositionQuery = `
        SELECT ranking.position
        FROM (
                 SELECT "movieId", AVG(ratings) AS avg_rating,
                        ROW_NUMBER() OVER (ORDER BY AVG(ratings) DESC) AS position
                 FROM public."ratings"
                 GROUP BY "movieId"
             ) AS ranking
        WHERE ranking."movieId" = $1;
    `;
    const ratingPositionResult = await query(ratingPositionQuery, [id]);
    const ratingPosition = ratingPositionResult.rows[0]?.position || 0;

    const overallRatingResult = await query('SELECT AVG(ratings) AS rating_avg FROM public."ratings" WHERE "movieId" = $1',[id])
    const overallRating = parseFloat(overallRatingResult.rows[0]?.rating_avg || 0).toFixed(2);

    return NextResponse.json({ rating: result1?.rows[0], follow: result2.rows[0] , overallRating, followCount, ratingCount, ratingPosition});
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth();

        const { id } = params;
        const userId = session?.user?.userid;



        const formData = await req.json();
        const rating = parseInt(formData.rating, 10);

        const followType = formData.followType;
        let result;
        let result2;


         if (!(isNaN(rating))) {
            const userCheckRating = await query('SELECT * FROM public."ratings" WHERE "userId" = $1 AND "movieId" = $2', [userId, id]);

            if (userCheckRating.rows.length > 0) {
                console.log('found already!!')
                if (followType === "Plan To Watch") {
                    await query('DELETE FROM public."ratings" WHERE "userId" = $1 AND "movieId" = $2', [userId, id]);
                    result = null;
                }
                else {
                    result = await query(
                        'UPDATE public."ratings" SET ratings = $1 WHERE "userId" = $2 AND "movieId" = $3 RETURNING *',
                        [rating, userId, id]
                    );
                    }
            } else {
                result = await query(
                    'INSERT INTO public."ratings" (ratings, "movieId", "userId") VALUES($1, $2, $3) RETURNING *',
                    [rating, id, userId]
                );
            }
        }

        const userCheckFollowed = await query('SELECT * FROM public."followedMovies" WHERE "userId" = $1 AND "movieId" = $2', [userId, id]);

        if (userCheckFollowed.rows.length > 0) {
            console.log('found already!!')
            result2 = await query(
                'UPDATE public."followedMovies" SET "followType" = $1 WHERE "userId" = $2 AND "movieId" = $3 RETURNING *',
                [followType, userId, id]
            );
        } else {
            result2 = await query(
                'INSERT INTO public."followedMovies" ("followType", "movieId", "userId") VALUES($1, $2, $3) RETURNING *',
                [followType, id, userId]
            );
        }

        return NextResponse.json({ rating: result?.rows[0], follow: result2.rows[0] });
    } catch (error) {
        console.error("Failed to insert data:", error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}