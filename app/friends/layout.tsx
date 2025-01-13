import { auth } from "@/auth"
import {redirect, useRouter} from "next/navigation"





export default async function Layout({ children,params }: { children: React.ReactNode, params: {id:string} }) {
    const session = await auth()
    if (!session) redirect("/")

    return <>{children}</>
}