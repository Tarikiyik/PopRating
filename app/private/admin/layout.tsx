import { auth } from "@/auth"
import {redirect, useRouter} from "next/navigation"
import "@/app/private/admin/admin.css";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: 'PopRating | Admin',
};


export default async function Layout({ children,params }: { children: React.ReactNode, params: {id:string} }) {
    const session = await auth()
    if (!session?.user?.isAdmin) redirect("/")


    return <>{children}</>
}