'use client'
import Link from "next/link"
import {FormEvent, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";


export default function register() {
    const {data: session} = useSession() 
    const router = useRouter()
    const [errorMessage,setErrorMessage] = useState<string | null>(null)
    
    
    
    if (session?.user){
        router.push('/')
    }

 
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const username = formData.get('username')?.toString()
        const usernameRegex = /^[a-zA-Z1-9_]+$/
        if (!username || !usernameRegex.test(username)){
            setErrorMessage('Username must not contain space or special characters')
            return
        }
        if(username && username.length < 2){
            setErrorMessage('Username must be longer than 1 characters')
            return
        }   
        const password = formData.get('password')?.toString()
        if(password && password.length < 8){
            setErrorMessage('Password must be longer than 8 characters')
            return
        }
        
        const birthday = formData.get('birthday')?.toString()
        if(birthday && new Date(birthday) > new Date()){
            setErrorMessage('Please enter a valid birthday')
            return
        }
        
        
        
        const response = await fetch('/api/register',{
            method: "POST",
            body: JSON.stringify({
                email: formData.get('email'),
                username: formData.get('username'),
                password: formData.get('password'),
                birthday: formData.get('birthday'),
                createdAt: new Date()
            })
        })


        if(response.ok){
            router.push('/private/authentication/login')
        }
        else{
            const serverMessage = await response.json()
            setErrorMessage(serverMessage.message)
        }
    }

    return (
        <div className="login-wrapper flex items-center justify-center text-white">
            <div className="register-container">
                <div className={"inner-register-container"}>
                    <div className={"flex ml-3 mb-20 "}>
                        <Link href={"/private/authentication/login"}><h1 className={"text-xl font-bold mt-2 text-gray-500 opacity-50 cursor-pointer"}>Login</h1></Link>
                        <h1 className={"text-3xl font-bold "}>/</h1>
                        <Link href={"/private/authentication/register"}><h1 className={"text-3xl font-bold cursor-pointer"}>Register</h1></Link>
                    </div>
                    <form className={"text-black"} onSubmit={handleSubmit}>
                        <label className={"block ml-2 text-white font-bold"}
                               htmlFor={"username-register"}>Username:</label>
                        <input
                            type={"text"}
                            name={"username"}
                            className={"w-80 m-2 mb-6 rounded-lg p-1"}
                            placeholder={"username"}
                            id={"username-register"}
                            required
                        />

                        <label className={"block ml-2 text-white font-bold"}
                               htmlFor={"email-register"}>Email:</label>
                        <input
                            type={"text"}
                            name={"email"}
                            className={"w-80 m-2 mb-4 rounded-lg p-1"}
                            placeholder={"example@mail.com"}
                            id={"email-register"}
                            required
                        />


                        <label className={"block ml-2 text-white font-bold"}
                               htmlFor={"password-register"}>Password:</label>
                        <input
                            type={"password"}
                            name={"password"}
                            className={"w-72 m-2 rounded-lg p-1 mb-2"}
                            placeholder={"password"}
                            id={"password-register"}
                            required
                        />
                        <label className={"block ml-2 text-white font-bold"}
                               htmlFor={"birthday-register"}>Birthday:</label>
                        <input
                            type={"date"}
                            name={"birthday"}
                            className={" m-2 rounded-lg p-1 custom-datepicker"}
                            id={"birthday-register"}
                            required
                        />
                        <div>
                            {errorMessage && <p className="text-red-500 text-center ">{errorMessage}</p>}

                            <button className={"login-button px-12 py-2 block mx-auto mt-8 mb-4 text-white"}
                                    type={"submit"}>Register
                            </button>
                            <p className="text-center text-white">
                                Do have an account? <Link href="/private/authentication/login"
                                                          className="text-blue-500 hover:underline">Login
                                here</Link>.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}