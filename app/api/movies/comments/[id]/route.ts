import { NextRequest, NextResponse } from "next/server";
import { query } from '@/lib/database';
import { auth } from "@/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    const result = await query('SELECT * FROM public."comments" WHERE "movieId" = $1', [id]);
    const commentCountResult = await query('SELECT COUNT(*) AS comment_count FROM public."comments" WHERE "movieId" = $1', [id]);
    const commentCount = commentCountResult.rows[0]?.comment_count || 0;

    return NextResponse.json({ comments: result?.rows, commentCount });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth();

        const { id } = params;
        const userId = session?.user?.userid;
        
        const formData = await req.json();

        const comment = formData.comment;
        if(comment === '')
            return NextResponse.json({ message: 'You can`t send empty comments' }, { status: 400 });
        
        const createdAt = new Date()
       
        const result = await query('INSERT INTO public.comments ("userId", content, created_at, "movieId",username) VALUES($1,$2,$3,$4,$5) RETURNING * ', [userId,comment,createdAt,id,session?.user?.name])
        

        
        

        return NextResponse.json({ rating: result?.rows[0]});
    } catch (error) {
        console.error("Failed to insert data:", error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
        }

        const result = await query('DELETE FROM public.comments WHERE "commentId" = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        return NextResponse.json({ message: 'Successfully deleted the comment' }, { status: 200 });
    } catch (error) {
        console.error("Failed to delete data:", error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}