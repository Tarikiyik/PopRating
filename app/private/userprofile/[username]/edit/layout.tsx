import { auth } from "@/auth"
import {redirect, useRouter} from "next/navigation"


export default async function Layout({ children,params }: { children: React.ReactNode, params: {username:string} }) {
    const session = await auth()
    const username = params?.username;
    const urlUserName = String(username)
    const sessionName = String(session?.user?.name)
    if (sessionName !== urlUserName) {
        redirect(`/private/userprofile/${session?.user?.name}/edit`);
    }

    return <>{children}</>
}