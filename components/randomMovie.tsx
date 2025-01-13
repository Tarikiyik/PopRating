"use client"; 

import React from "react";
import { useRouter } from "next/navigation";

const RandomMovieButton = () => {
    const router = useRouter();

    const handleRandomMovie = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/movies/randommovie', {
                method: 'GET',
            });
            const randomMovie = await response.json();
            if (response.ok) {
                console.log('Random movie:', randomMovie);
                router.push(`/details/${randomMovie.movieId}`); 
            } else {
                console.error('Error fetching random movie:', randomMovie.message);
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };

    return (
        <button className="random-movie-button" onClick={handleRandomMovie}>
            Pick a Movie!
        </button>
    );
};

export default RandomMovieButton;