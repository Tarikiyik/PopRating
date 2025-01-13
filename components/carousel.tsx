'use client'
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface Movie {
    movieCarousel: string;
    movieName: string;
    movieId: string;
    movieDesc: string;
}

const Carousel = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalDuration = 10000;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchImages = async () => {
        try {
            const response = await fetch('/api/movies');
            if (!response.ok) {
                throw new Error('Failed to fetch images');
            }
            const data = await response.json();
            const moviesWithCarousel = data.filter((movie: any) => movie.movieCarousel).map((movie: any) => ({
                movieCarousel: movie.movieCarousel,
                movieName: movie.movieName,
                movieDesc: movie.movieDesc,
                movieId: movie.movieId,
            }));
            console.log('Fetched images:', moviesWithCarousel);
            setMovies(moviesWithCarousel);
        } catch (error) {
            console.error('Error fetching carousel images:', error);
        }
    };

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    const startTimer = () => {
        resetTimeout();
        timeoutRef.current = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
        }, intervalDuration);
    };

    useEffect(() => {
        fetchImages();
    }, []);

    useEffect(() => {
        if (movies.length > 0) {
            startTimer();
        }
        return () => resetTimeout();
    }, [movies, currentIndex]);

    const handleClick = (index: number) => {
        setCurrentIndex(index);
    };

    if (movies.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div className="carousel mb-8">
            <div className="relative">
                <div className="carousel-img flex items-center justify-center overflow-hidden">
                    <img
                        src={`/images/homeslider_banners/${movies[currentIndex].movieCarousel}`}
                        alt={`image ${currentIndex}`}
                        className="object-cover w-full h-full"
                    />
                </div>
                <div className="carousel-details">
                    <div className="font-bold text-5xl">
                        {movies[currentIndex].movieName}
                    </div>
                    <div className="mt-4 opacity-80">
                        {movies[currentIndex].movieDesc}
                    </div>
                    <div className="carousel-inspect">
                        <Link className="cinspect" href={`/details/${movies[currentIndex].movieId}`}>
                            Inspect
                        </Link>
                    </div>
                </div>
                <div className="absolute bottom-0 w-full flex justify-center space-x-2 p-2">
                    {movies.map((_, index) => (
                        <button
                            key={index}
                            className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-400'}`}
                            onClick={() => handleClick(index)}
                        />
                    ))}
                </div>
            </div>
            <div className="carousel-small-img flex justify-center mt-4 space-x-10">
                {movies.map((image, index) => (
                    <img
                        key={index}
                        src={`/images/homeslider_banners/${movies[index].movieCarousel}`}
                        alt={`Image ${index}`}
                        className={`hover:scale-110 object-cover cursor-pointer ${index === currentIndex ? 'scale-125' : ''} transition ease-in-out duration-300`}
                        onClick={() => handleClick(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel;