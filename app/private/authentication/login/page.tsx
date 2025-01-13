'use client'
import Link from "next/link"
import {FormEvent, useState} from "react"
import { signIn , useSession} from 'next-auth/react'
import {useRouter} from "next/navigation";
import {useGoogleReCaptcha} from "react-google-recaptcha-v3";

export default function Login() {
    const reCaptchaKey: string | undefined = process?.env?.NEXT_PUBLIC_RECAPTCHA_KEY
    const {data: session} = useSession()
    const router = useRouter()
    const [error,setError] = useState("")
    
    const { executeRecaptcha } = useGoogleReCaptcha()
    
    
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
        const formData = new FormData(e.currentTarget)
        
        if(!executeRecaptcha) {
            console.log("no")
            return
        }
        
        
        const gRecaptchaToken = await executeRecaptcha('inquirySubmit')
        
        const response = await fetch('/api/reCaptchaSubmit',{
            method: 'POST',
            body: JSON.stringify({
                gRecaptchaToken,
            }),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type":"application/json",
            },
        })
        const resultCaptcha = await response.json();

        if (resultCaptcha.success) {
            console.log("Recaptcha validation successful:", resultCaptcha);
        } else {
            console.error("Recaptcha validation failed:", resultCaptcha.error || "Unknown error");
            setError(resultCaptcha.error || "Recaptcha validation failed");
        }

        const result = await signIn('credentials',{
            username:formData.get('username'),
            password:formData.get('password'),
            redirect: false,
        })
        
        if (!result?.error){
            router.push("/")
            router.refresh()
        }
        else if(result?.error){
            setError(result.error)
        }

    }
    

    return (
        <div className="login-wrapper flex items-center justify-center text-white">
            <div className="login-container">
                <div className={"inner-login-container"}>
                    <div className={"flex ml-3 mb-20 "}>
                        <Link href={"/private/authentication/login"}><h1
                            className={"text-3xl font-bold cursor-pointer"}>Login</h1></Link>
                        <h1 className={"text-3xl font-bold "}>/</h1>
                        <Link href={"/private/authentication/register"}><h1
                            className={"text-xl font-bold mt-2 text-gray-500 opacity-50 cursor-pointer"}>Register</h1>
                        </Link>
                    </div>
                    <form className={"text-black"} onSubmit={handleSubmit}>
                        <label className={"block ml-2 text-white font-bold"}
                               htmlFor={"username-login"}>Username:</label>
                        <input
                            type={"text"}
                            name={"username"}
                            className={"w-80 m-2 mb-12 rounded-lg p-1"}
                            placeholder={"username"}
                            id={"username-login"}
                            required
                        />


                        <label className={"block ml-2 text-white font-bold"}
                               htmlFor={"password-login"}>Password:</label>
                        <input
                            type={"password"}
                            name={"password"}
                            className={"w-72 m-2 rounded-lg p-1"}
                            placeholder={"password"}
                            id={"password-login"}
                            required
                        />
                        <div className={"mt-12"}>
                            {error && <p className="text-red-500 text-center ">You have entered an invalid username or
                                password</p>}
                            <button className={"login-button px-12 py-2 block mx-auto mt-2 mb-4 text-white"}
                                    type={"submit"}>Login
                            </button>
                            <p className="text-center text-white">
                                Don't have an account? <Link href="/private/authentication/register"
                                                             className="text-blue-500 hover:underline">Register
                                here</Link>.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}