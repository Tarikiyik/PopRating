import { auth } from "@/auth"
import {redirect, useRouter} from "next/navigation"
import "@/app/private/userprofile/profilepage.css";





export default async function Layout({ children,params }: { children: React.ReactNode, params: {id:string} }) {
    const session = await auth()
    if (!session) redirect("/")
    
    return <>{children}</>
}