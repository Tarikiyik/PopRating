'use client';
import React, { useEffect, useState } from "react";
import '@/app/tvshows/tvlist.css';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import Link from "next/link";
import { Divider } from "@nextui-org/divider";
import CircularProgress from "@/components/circularProgress";


interface Movie {
    movieId: string;
    movieName: string;
    type: boolean;
    movieDesc: string;
    genre: string;
    director: string;
    releaseDate: string;
    trailerUrl: string;
    movieBanner: string;
    trailerBanner: string;
    movieCarousel: string;
    tmdbId?: number; 
    status?: string;
    rating?: number
}

export default function MoviesPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [selectedFilterKeys, setSelectedFilterKeys] = useState(new Set<string>(["All Tv Shows"]));
    const [loading, setLoading] = useState(false)
    const [topRatedShows, setTopRatedShows] = useState<Movie[]>([]);


    const selectedFilter = React.useMemo(() => {
        return selectedFilterKeys.size === 0
            ? 'All Tv Shows'
            : Array.from(selectedFilterKeys).join(', ').replaceAll('_', ' ');
    }, [selectedFilterKeys]);

    useEffect(() => {
        async function fetchAllOnAirShows() {
            // @ts-ignore
            let allOnAirShows = [];
            let page = 1;
            let totalPages = 1;

            try {
                while (page <= totalPages) {
                    const onAirResponse = await fetch(`https://api.themoviedb.org/3/tv/on_the_air?page=${page}`, {
                        method: 'GET',
                        headers: {
                            accept: 'application/json',
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                        }
                    });

                    if (!onAirResponse.ok) {
                        throw new Error(`Failed to fetch on-air TV shows: ${onAirResponse.statusText}`);
                    }

                    const onAirData = await onAirResponse.json();
                    totalPages = onAirData.total_pages;
                    // @ts-ignore
                    allOnAirShows = [...allOnAirShows, ...onAirData.results];
                    page++;
                }
                // @ts-ignore
                return allOnAirShows.map((show: any) => show.name);
            } catch (error) {
                console.error("Error fetching on-air TV shows", error);
                return [];
            }
        }

        async function fetchMovies() {
            try {
                const response = await fetch('/api/movies');
                const data = await response.json();

                let filteredMovies = data.filter((movie: Movie) => movie.type === false);

                if (selectedFilterKeys.has("On Air")) {
                    setLoading(true)
                    const onAirShows = await fetchAllOnAirShows();
                    console.log(onAirShows)

                    filteredMovies = await Promise.all(filteredMovies.map(async (movie: Movie) => {
                        const searchType = 'tv';
                        const searchOptions = {
                            method: 'GET',
                            headers: {
                                accept: 'application/json',
                                Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                            }
                        };

                        const searchResponse = await fetch(`https://api.themoviedb.org/3/search/${searchType}?query=${movie.movieName}`, searchOptions);
                        if (!searchResponse.ok) {
                            console.error(`Failed to search for TV show: ${searchResponse.statusText}`);
                            return null;
                        }

                        const searchData = await searchResponse.json();
                        if (searchData.results.length === 0) {
                            console.error(`TV series not found: ${movie.movieName}`);
                            return null;
                        }

                        const mediaId = searchData.results[0].id;
                        movie.tmdbId = mediaId;

                        const detailsResponse = await fetch(`https://api.themoviedb.org/3/${searchType}/${mediaId}`, searchOptions);
                        if (!detailsResponse.ok) {
                            console.error(`Failed to fetch TV show details: ${detailsResponse.statusText}`);
                            return null;
                        }

                        const detailsData = await detailsResponse.json();
                        movie.status = detailsData.status;
                        

                        if (onAirShows.includes(movie.movieName)) {
                            return movie;
                        }
                        return null;
                    }));
                    // @ts-ignore
                    filteredMovies = filteredMovies.filter(movie => movie !== null) as Movie[];
                }
                else if(selectedFilterKeys.has("Upcoming")){
                    const today = new Date()
                    filteredMovies = data.filter((movie: Movie) => new Date(movie.releaseDate) > today && movie.type === false);
                }

                setMovies(filteredMovies);
            } catch (error) {
                console.error("Error fetching movies", error);
            }
            finally {
                if (selectedFilterKeys.has("On Air")) {
                    setTimeout(() => setLoading(false), 3000);
                } else {
                    setLoading(false);
                }            }
        }
        fetchMovies();
    }, [selectedFilterKeys]);

    useEffect(() => {
        async function fetchRatings() {
            const RatingMovies = await Promise.all(
                movies.map(async (movie) => {
                    const response = await fetch(`/api/movies/rating/${movie.movieId}`)
                    const data = await response.json()
                    return { ...movie, rating: data.overallRating }
                })
            )
            const sortedShows = RatingMovies.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
            setTopRatedShows(sortedShows)

        }
        if (movies.length > 0) {
            fetchRatings()
        }
    }, [movies.length])
    
    return (
        <div className="movies-wrapper">
            <div className={"movies-container"}>
                <div className={"movies-upper-container"}>
                    <div className={"movie-option"}>
                        <Link className={"non-active"} href={"/movies"}>Movies</Link>
                        <h1>/</h1>
                        <Link className={"active"} href={"/tvshows"}>Tv Shows</Link>
                    </div>
                    <div className="text-white ml-4">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button variant="bordered"
                                        className="capitalize dd-add w-48">
                                    {selectedFilter}
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                className={"dd-add-items"}
                                aria-label="Single selection example"
                                variant="flat"
                                disallowEmptySelection
                                selectionMode="single"
                                selectedKeys={selectedFilterKeys}
                                // @ts-ignore
                                onSelectionChange={setSelectedFilterKeys}
                            >
                                <DropdownItem className="dd-add-item"
                                              key="All Tv Shows">All Tv Shows</DropdownItem>
                                <DropdownItem className="dd-add-item" key="On Air">On Air</DropdownItem>
                                <DropdownItem className="dd-add-item" key="Upcoming">Upcoming</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
                <div className={"flex justify-center items-center"}>
                    <Divider orientation="horizontal" className={"movies-h-divider"}/>
                </div>
                <div className={"movies-lower-container"}>
                    {loading ? (
                        <div className="loading-container flex justify-center items-center h-full w-full">
                            <CircularProgress />
                        </div>
                    ) : (
                        topRatedShows.map(movie => (
                                <div key={movie.movieId} className="slider-item">
                                    <img
                                        src={`/images/movie_banners/${movie.movieBanner}`}
                                        alt={`image`}
                                        className={"object-fill w-full h-full"}
                                    />
                                    <div className={"overlay"}>
                                        <div className={"overlay-button"}>
                                            <div className={"flex justify-center items-center"}>
                                                <Divider orientation="horizontal" className={"overlay1-h-divider"} />
                                            </div>
                                            <Link className={"overlay-link"} href={`/details/${movie.movieId}`}>Inspect</Link>
                                            <div className={"flex justify-center items-center"}>
                                                <Divider orientation="horizontal" className={"overlay2-h-divider"} />
                                            </div>
                                        </div>
                                        <div className={"overlay-star"}>
                                            {movie.rating && (
                                                <p>{movie.rating}<span className="material-symbols-outlined">star</span></p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
}