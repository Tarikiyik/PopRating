'use client'
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';



interface User {
    userid: string;
    username: string;
    userdesc: string;
    userpic: string;
}

const SearchUser = ({ setSearchVisible }: { setSearchVisible: (visible: boolean) => void }) => {
    const [users, setUsers] = useState<User[]>([]);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const query = searchParams.get('query')?.toString() || null;



    const handleSearch = useDebouncedCallback((term) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    },300)
    const fetchUsers = async (searchQuery:string) => {
        try {
            const response = await fetch(`/api/friends/searchusers?query=${searchQuery}`,{
                method:'GET'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch friends');
            }
            const data = await response.json();
            setUsers(data);
            console.log(users)
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    useEffect(() => {
        // @ts-ignore
        fetchUsers(query);
    }, [query]);

    const truncateDesc = (text: string, maxLength: number): string => {
        if (!text) return '';
        if (text.length <= maxLength) {
            return text;
        }
        return text.slice(0, 48) + '...';
    };

    return (
        <div className="searchf-container">
        <div className={"searchf-wrapper"}>
        <div className={"closef-search"}><span onClick={() => setSearchVisible(false)} className="material-symbols-outlined">close</span></div>
    <div className={"searchf-bar"}>
    <input
        placeholder={"Search for Users"}
    onChange={(e) => handleSearch(e.target.value)}
    defaultValue={searchParams.get('query')?.toString()}
    />
    </div>
    <div className={"searchf-results"}>
        {users.map(user => (
                <Link onClick={() => setSearchVisible(false)} href={`/private/userprofile/${user.username}`}>
    <div className={"searchf-result"}>
    <div className={"searchf-img-text"}>
    <img src={`/images/profilepictures/${user.userpic}`}/>
    <h1 className={"ml-12"}>{user.username}</h1>

        </div>
        <div className={"mr-2"}>
        {truncateDesc(user.userdesc,48)}
    </div>
    </div>
    </Link>
))}
    </div>
    </div>
    </div>
);
};

const SearchComponentWrapper = () => {
    const [isSearchVisible, setSearchVisible] = useState(false);
    return (
        <div>
            <span
                onClick={() => setSearchVisible(!isSearchVisible)}
                className="material-symbols-outlined hover:brightness-75 cursor-pointer ml-2 mt-1 text-2xl"
        >
        search
        </span>
    {isSearchVisible && <SearchUser setSearchVisible={setSearchVisible} />}
    </div>
    );
    };

    export default SearchComponentWrapper;