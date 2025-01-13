import NextAuth, {DefaultUser} from "next-auth";

declare module "next-auth" {
    interface User extends DefaultUser {
        isAdmin: boolean
        userid: string
        email: string
        createdAt: Date
        birthday: Date
        userdesc: string
        userpic: string
        userbg: string
        favsecure: boolean
        prfsecure: boolean
    }
}