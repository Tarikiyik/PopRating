'use client';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import SignOutButton from "@/app/api/auth/signout";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@nextui-org/react";
import Search from "@/components/search";

export default function Navbar() {
    const { data: session, status } = useSession();
    const isAdmin = session?.user?.isAdmin;
    const profileImg = session?.user?.userpic;
    const profileImgURL = profileImg ? `/images/profilepictures/${profileImg}` : '/images/default-avatar.png';

    return (
        <nav className="fixed w-full navbar top-0 left-0">
            <div className="wrapper flex justify-between items-center text-white font-bold">
                <div className={"my-1 w-1/3 flex items-center"}>
                <Link href="/" className="text-3xl hover:brightness-75 transition ease-out duration-100"><img className={"logo-nav"} src={'/images/logo/poprating-logo-d.png'}/></Link>
                    <div className={"flex ml-6 h-16 items-end text-2xl"}>
                    <a href="/movies" className="nav-navigation  ml-4 cursor-pointer">Movies</a>
                    <a href="/tvshows" className="nav-navigation  ml-8 cursor-pointer">Tv Shows</a>
                    </div>
                </div>
                    <ul className="flex items-end text-xl gap-10 h-16">
                    {status === 'loading' ? (
                        <li>Loading...</li>
                    ) : (
                        <>
                            <li>
                                <Search/>
                            </li>
                            {session && isAdmin && (
                                <li className="hover:brightness-75 transition ease-out duration-100">
                                    <Link href="/private/admin"><span className={"material-symbols-outlined"}>admin_panel_settings</span></Link>
                                </li>
                            )}
                            {session ? (
                                <li className="hover:brightness-75 transition ease-out duration-100">
                                    <div className="flex items-center gap-4">
                                        <Dropdown placement="bottom-end">
                                            <DropdownTrigger>
                                                <Avatar
                                                    as="button"
                                                    className="transition-transform"
                                                    src={profileImgURL}
                                                />
                                            </DropdownTrigger>
                                            <DropdownMenu aria-label="Profile Actions" variant="flat" className={"navdrop"}>
                                                <DropdownItem key="profile" className="h-14 gap-2">
                                                    <p className="font-semibold">Hello,</p>
                                                    <p className="font-semibold">{session.user?.name}</p>
                                                </DropdownItem>
                                                <DropdownItem key="profpage" href={`/private/userprofile/${session?.user?.name}`} className={"navlidrop"}>
                                                    Profile Page
                                                </DropdownItem>
                                                <DropdownItem key="settings" href={`/private/userprofile/${session?.user?.name}/edit`} className={"navlidrop"}>
                                                    Settings
                                                </DropdownItem>
                                                <DropdownItem key="logout" color="danger" className={"navlogoutdrop"}>
                                                    <SignOutButton />
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                </li>
                                
                            ) : (
                                <li className="hover:brightness-75 transition ease-out duration-100">
                                    <Link href="/private/authentication/login">Login</Link>
                                </li>
                            )}
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}