'use client'
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';



interface Movie {
    movieName: string;
    movieId: string;
    movieDesc: string;
    movieBanner: string;
    releaseDate: Date;
}

const SearchAdmin = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [searchMovie, setSearchMovie] = useState<Movie | null>(null);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const query = searchParams.get('query')?.toString() || null;
    const params = useParams(); 
    const { id } = params;


    const handleSetSelectedMovie = async (movieId: string) => {
        try {
            const response = await fetch(`/api/movies/${movieId}`, {
                method: 'GET',
            });

            if (response.ok) {
                const data = await response.json()
                setSearchMovie(data)
            }
            console.log(searchMovie)
            
        } catch (error) {
            console.error('Error fetching movie:', error);
        }
    };

    const handleSetPrequel = async (movieId: string,prequelid: string) => {
        try {
            const response = await fetch(`/api/movies/${movieId}/searchprequel/${prequelid}`, {
                method: 'POST',
            });

            if (response.ok) {
                alert('Successfully uploaded prequel!'); 
                console.log('successfully uploaded')
            }

        } catch (error) {
            console.error('Error fetching movie:', error);
        }
    };

    const handleSetSequel = async (movieId: string,sequelid: string) => {
        try {
            const response = await fetch(`/api/movies/${movieId}/searchsequel/${sequelid}`, {
                method: 'POST',
            });

            if (response.ok) {
                alert('Successfully uploaded sequel!');
                console.log('successfully uploaded')
            }

        } catch (error) {
            console.error('Error fetching movie:', error);
        }
    };

    const handleClear = async (movieId: string) => {
        try {
            const response = await fetch(`/api/movies/${movieId}/searchclear`, {
                method: 'POST',
            });

            if (response.ok) {
                alert('Successfully cleared!');
                console.log('successfully cleared')
            }

        } catch (error) {
            console.error('Error fetching movie:', error);
        }
    };



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
    

    return (
        <div className="searcha-container">
            <div className={"searcha-left"}>
            <div className={"searcha-wrapper"}>
                <div className={"searcha-bar"}>
                <input
                placeholder={"Search for Movies"}
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('query')?.toString()}
                />
            </div>
            <div className={"searcha-results"}>
                {movies.map(movie => (
                    <div className={"searcha-result"} onClick={() => handleSetSelectedMovie(movie.movieId)}>
                    <div className={"searcha-img-text"}>
                    <img src={`/images/movie_banners/${movie.movieBanner}`}/>
                    <h1 className={"ml-12"}>{movie.movieName}</h1>
                </div>
            </div>
            ))}
            </div>
            </div>
            </div>
                <div className={"searcha-right"}>
                    <div className={"searcha-selected"}>
                        {searchMovie && (
                        <div className={"searcha-img-text"}>
                            
                            <img src={`/images/movie_banners/${searchMovie?.movieBanner}`}/>
                            <h1 className={"ml-12"}>{searchMovie?.movieName}</h1>
                        
                        </div>
                        )}
                    </div>
                    <div className={"searcha-buttons"}>
                        <button onClick={() => handleSetPrequel(id as string, searchMovie?.movieId as string)}
                                className={"ml-20"}>Save it as prequel
                        </button>
                        <button onClick={() => handleSetSequel(id as string, searchMovie?.movieId as string)}
                                className={"ml-20"}>Save it as sequel
                        </button>
                        <button onClick={() => handleClear(id as string)}
                                className={"ml-20"}>Clear connections
                        </button>
                    </div>

                </div>

        </div>
    );
};


export default SearchAdmin;