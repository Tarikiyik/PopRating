'use client';
import React, { useEffect, useState } from "react";
import '@/app/movies/movieslist.css';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import Link from "next/link";
import { Divider } from "@nextui-org/divider";

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
    rating?: number
}

export default function MoviesPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [selectedFilterKeys, setSelectedFilterKeys] = useState(new Set<string>(["All Movies"]));
    const [topRatedShows, setTopRatedShows] = useState<Movie[]>([]);

    
    const selectedFilter = React.useMemo(() => {
        return selectedFilterKeys.size === 0
            ? 'All Movies'
            : Array.from(selectedFilterKeys).join(', ').replaceAll('_', ' ');
    }, [selectedFilterKeys]);

    useEffect(() => {
        async function fetchMovies() {
            try {
                const response = await fetch('/api/movies',{
                    cache: 'force-cache',
                    next: {revalidate:3600},
                });
                const data = await response.json();
                let filteredMovies = data.filter((movie: Movie) => movie.type);
                if (selectedFilterKeys.has("Upcoming")) {
                    const today = new Date();
                    filteredMovies = filteredMovies.filter((movie: Movie) => new Date(movie.releaseDate) > today);
                }
                else if (selectedFilterKeys.has("On Theaters")) {
                    const today = new Date();
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(today.getDate() - 30);
                    filteredMovies = filteredMovies.filter((movie: Movie) => {
                        const releaseDate = new Date(movie.releaseDate);
                        return releaseDate <= today && releaseDate >= thirtyDaysAgo;
                    });
                }
                 setMovies(filteredMovies);
            } catch (error) {
                console.error("Error fetching movies", error);
            }
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
                        <Link className={"active"} href={"/movies"}>Movies</Link>
                        <h1>/</h1>
                        <Link className={"non-active"} href={"/tvshows"}>Tv Shows</Link>
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
                                onSelectionChange={(keys) => setSelectedFilterKeys(new Set(keys))}
                            >
                                <DropdownItem className="dd-add-item"
                                              key="All Movies">All Movies</DropdownItem>
                                <DropdownItem className="dd-add-item" key="On Theaters">On Theaters</DropdownItem>
                                <DropdownItem className="dd-add-item" key="Upcoming">Upcoming</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
                <div className={"flex justify-center items-center"}>
                    <Divider orientation="horizontal" className={"movies-h-divider"}/>
                </div>
                <div className="movies-lower-container">
                    {topRatedShows.length > 0 ? (
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
                                            <Divider orientation="horizontal" className={"overlay1-h-divider"}/>
                                        </div>
                                        <Link className={"overlay-link"}
                                              href={`/details/${movie.movieId}`}>Inspect</Link>
                                        <div className={"flex justify-center items-center"}>
                                            <Divider orientation="horizontal" className={"overlay2-h-divider"}/>
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
                    ) : (
                        <p className="text-white text-center">No movies found in this category.</p>
                    )}
                </div>
            </div>
        </div>
    )
        ;
}