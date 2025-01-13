import {Inter} from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import {auth} from '@/auth'
import {Providers} from "./Providers"
import Loading from "@/app/loading";
import ScrollToTop from "@/components/ScrollToTop"
import {Suspense} from "react";
import Footer from "@/components/footer";


const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "PopRating",
};


export default async function RootLayout({

                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth()

    return (
        <html lang="en">
        <body className={inter.className}>
        <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
            rel="stylesheet"/>
        <Providers>
            <Nav/>
            <Suspense fallback={<Loading/>}>
                {children}
                <ScrollToTop/>
            </Suspense>
            <Footer/>
        </Providers>
        </body>
        </html>
    );
}
