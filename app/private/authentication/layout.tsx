import { auth } from "@/auth"
import { redirect } from "next/navigation"
import '@/app/private/authentication/authentication.css'
import type {Metadata} from "next";



export const metadata: Metadata = {
    title: 'PopRating | Authentication',
};



export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    if (session) redirect("/")

    return <>{children}</>
}