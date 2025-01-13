import '@/app/details/moviedetails.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import {NextResponse} from "next/server";

export const metadata: Metadata = {
    title: 'PopRating | Details',
};

async function getData(id: string) {
    const res = await fetch(`http://localhost:3000/api/movies/${id}`);
    if (!res.ok) {
        return NextResponse.json({ error: 'Invalid Movie id' }, { status: 400 });
    }
    return res.json();
}

export default async function Layout({ children, params }: { children: ReactNode, params: { id: string } }) {
    const data = await getData(params.id);

    return (
        <>
            <title>{`PopRating | ${data.movieName}`}</title>
            {children}
        </>
    );
}