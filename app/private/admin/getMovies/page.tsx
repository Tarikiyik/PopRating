'use client';
import { useEffect, useState } from "react";


interface Movie {
    movieId: string;
    movieName: string;
    type: string;
    movieDesc: string;
    genre: string;
    director: string;
    releaseDate: string;
    trailerUrl: string;
    movieBanner: string;
    trailerBanner: string;
}



export default function Home(){
    const [movies,setMovies] = useState<Movie[]>([])

    useEffect(() => {
        async function fetchMovies(){
            try {
                const response = await fetch('/api/movies')
                const data = await response.json()
                console.log(data)
                setMovies(data)
            }
            catch (error){
                console.error("Error fetching movies",error)
            }
        }
        fetchMovies()
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-20 space-y-6">
            <ul>  
            {movies.map(movie => (
                <li key={movie.movieId}>{movie.movieName},{movie.movieDesc}</li>
            ))}
            </ul>
        </div>
    );
};

