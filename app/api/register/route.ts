import {NextResponse} from "next/server";
import {hash} from 'bcryptjs'
import { query } from '@/lib/database'

export async function POST(request: Request){
    try{
        const {email,username,password,birthday,createdAt,isAdmin} = await request.json()
        console.log ({email,username,password,birthday,createdAt})

        const existingUser = await query('SELECT username FROM public."Users" WHERE username = $1', [username]);
        console.log(existingUser);
        if (existingUser.rows.length > 0) 
            return NextResponse.json({message:'Username already exists'},{status:400})
        
        const existingMail = await query('SELECT email FROM public."Users" WHERE email = $1', [email])
        if (existingMail.rows.length > 0)   
            return NextResponse.json({message:'Email already exists'},{status:400})
        
        
        const hashedPassword = await hash(password,10)
        const response = await query('INSERT INTO public."Users" (email,username,password,birthday,"createdAt") VALUES($1,$2,$3,$4,$5) RETURNING *',
            [email, username, hashedPassword,birthday ,createdAt]
        )

    } catch (e){
        console.log({e})
    }

    return NextResponse.json({message:'success'})
}