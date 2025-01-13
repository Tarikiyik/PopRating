'use client'
import { signOut } from "next-auth/react";

export default function SignOutButton(){
    return <button  className={"w-full h-full text-left"} onClick={()=> signOut()} >Log Out</button>
}
