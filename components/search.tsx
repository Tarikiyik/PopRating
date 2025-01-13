'use client'
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';



interface Movie {
    movieName: string;
    movieId: string;
    movieDesc: string;
    movieBanner: string;
    releaseDate: Date;
}


const Search = ({ setSearchVisible }: { setSearchVisible: (visible: boolean) => void }) => {
    const [movies, setMovies] = useState<Movie[]>([]);
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
    const fetchMovies = async (searchQuery:string) => {
        try {
            const response = await fetch(`/api/movies/searchmovies?query=${searchQuery}`,{
                method:'GET'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }
            const data = await response.json();
            setMovies(data);
            console.log(movies)
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };
    
    useEffect(() => {
        // @ts-ignore
        fetchMovies(query);
    }, [query]);



    const formatDate = (dateString:string) => {
        console.log("Received dateString:", dateString);
        if(!dateString){
            return 'Date not available'
        }

        const date = new Date(dateString);


        const day = date.getDate();
        const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
        const year = date.getFullYear();

        const daySuffix = (day:number) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };

        return `${day}${daySuffix(day)} ${month} ${year}`;
    };
    
    return (
        <div className="search-container">
            <div className={"search-wrapper"}>
                <div className={"close-search"}><span onClick={() => setSearchVisible(false)} className="material-symbols-outlined">close</span></div>
                <div className={"search-bar"}>
                <input
                placeholder={"Search for Movies"}
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('query')?.toString()}
                />
                </div>
                <div className={"search-results"}>
                    {movies.map(movie => (
                        <Link onClick={() => setSearchVisible(false)} href={`/details/${movie.movieId}`}>
                            <div className={"search-result"}>
                                <div className={"search-img-text"}>
                                    <img src={`/images/movie_banners/${movie.movieBanner}`}/>
                                    <h1 className={"ml-12"}>{movie.movieName}</h1>

                                </div>
                                <div className={"mr-2"}>
                                    {formatDate(movie.releaseDate.toString())}
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
                className="material-symbols-outlined hover:brightness-75 cursor-pointer"
            >
                search
            </span>
            {isSearchVisible && <Search setSearchVisible={setSearchVisible} />}
        </div>
    );
};

export default SearchComponentWrapper;