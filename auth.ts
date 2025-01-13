import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { query } from '@/lib/database'
import {hash} from "bcrypt";

 
const bcrypt = require('bcrypt')

async function getUserData(userid: string) {
    const result = await query(
        'SELECT * FROM public."Users" WHERE userid = $1',
        [userid]
    );
    return result.rows[0];
}


export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {

                if (!credentials?.username || !credentials?.password) {
                    console.log("Missing credentials");
                    return null;
                }

                try {
                    console.log("Attempting database query");
                    const result = await query(
                        'SELECT * FROM public."Users" WHERE username = $1',
                        [credentials.username]
                    );

                    const user = result.rows[0];
                    console.log("User found:", user ? "Yes" : "No");
                    const decryptedPassword = await bcrypt.compare(credentials.password,user.password)

                    if (user && decryptedPassword) {
                        console.log("Password match: Yes");
                        return { userid: user.userid, name: user.username, email: user.email,isAdmin: user.isAdmin,createdAt: user.createdAt,birthday: user.birthday,userdesc: user.userdesc,userpic: user.userpic,userbg: user.userbg,favsecure: user.favsecure,prfsecure: user.prfsecure};
                    } else {
                        console.log("Password match: No");
                        throw new Error('You have entered an invalid username or password')
                    }
                } catch (error) {
                    console.error('Error during authentication:', error);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/authentication/login',
    },
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy:"jwt",
        maxAge: 2592000,
    },
    callbacks: {
        async jwt({ token, user ,trigger,session}) {
            if (user) {
                token.userid = user.userid;
                token.email = user.email;
                token.isAdmin = user.isAdmin;
                token.createdAt = user.createdAt;
                token.birthday = user.birthday;
                token.name = user.name;
                token.userpic = user.userpic
                token.userdesc = user.userdesc
                token.userbg = user.userbg
                token.favsecure = user.favsecure
                token.prfsecure = user.prfsecure
            }
            if (trigger === 'update') {
                token.name = session.user.name;
                token.birthday = session.user.birthday;
                token.userpic = session.user.userpic
                token.userbg = session.user.userbg
                token.userdesc = session.user.userdesc
                token.favsecure = session.user.favsecure
                token.prfsecure = session.user.prfsecure
            }
    
            
            return token;
        },
        async session({ session, token }) {
            session.user.userid = token.userid as string;
            session.user.email = token.email as string;
            session.user.isAdmin = token.isAdmin as boolean;
            session.user.createdAt = token.createdAt as Date;
            session.user.birthday = token.birthday as Date;
            session.user.name = token.name as string;
            session.user.userdesc = token.userdesc as string
            session.user.userpic = token.userpic as string
            session.user.userbg = token.userbg as string
            session.user.favsecure = token.favsecure as boolean
            session.user.prfsecure = token.prfsecure as boolean
            return session;
        },
    },
})
