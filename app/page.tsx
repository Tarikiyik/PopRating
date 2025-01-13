import Link from 'next/link';
import React from "react";
import Carousel from '@/components/carousel';
import { Divider } from "@nextui-org/divider";
import Slider from '@/components/slider';
import RandomMovieButton from '@/components/randomMovie'; 

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
    rating?: number;
}

export default async function Page() {

    const response = await fetch('http://localhost:3000/api/movies',{
        next: {revalidate: 3600}
    });
    const movies: Movie[] = await response.json();
    const RatingMovies = await Promise.all(
        movies.map(async (movie: Movie) => {
            const response = await fetch(`http://localhost:3000/api/movies/rating/${movie.movieId}`);
            const data = await response.json();
            return { ...movie, rating: data.overallRating };
        })
    );
    


    const sortedMovies = RatingMovies.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    const topRatedMovies = sortedMovies.filter(movie => movie.type).slice(0, 10);
    const topRatedTvShows = sortedMovies.filter(movie => !movie.type).slice(0, 10);
    const topRatedShows = sortedMovies.slice(0, 10);

    const renderSlider = (title: string, movies: Movie[], link?: string) => (
        <div className="wrapper text-4xl font-bold underline my-2">
            {link ? <Link href={link}>{title}</Link> : title}
            <Slider>
                {movies.map(movie => (
                    <div className="slider-item" key={movie.movieId}>
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
                ))}
            </Slider>
        </div>
    );

    return (
        <div className="text-white">
            <Carousel/>
            {renderSlider("Most Rated", topRatedShows)}
            {renderSlider("Most Rated Movies", topRatedMovies, "/movies")}
            {renderSlider("Most Rated TV Shows", topRatedTvShows, "/tvshows")}
            <div className={"random-movie-container"}>
                <p className={"random-movie-text"}>Not sure what to watch? Let us pick a movie for you!</p>
                <RandomMovieButton/>
            </div>
            <div className={"mb-32"}></div>
        </div>
    );
}