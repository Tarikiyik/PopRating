import { ReactNode } from 'react';
import {NextResponse} from "next/server";



async function getData(username: string) {
    const res = await fetch(`http://localhost:3000/api/profile/${username}`);
    if (!res.ok) {
        return NextResponse.json({ error: 'Invalid user name' }, { status: 400 });
    }
    return res.json();
}

export default async function Layout({ children, params }: { children: ReactNode, params: { username: string } }) {
    const data = await getData(params.username);

    return (
        <>
            <title>{`PopRating | ${data.username}`}</title>
            {children}
        </>
    );
}