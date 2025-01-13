'use client';
import Link from "next/link"
import {Divider} from "@nextui-org/divider";
import YouTubeEmbed from '@/components/YoutubeEmbed';
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";



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
}


export default function Admin(){
    const [movies,setMovies] = useState<Movie[]>([])
    const router = useRouter()
    


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


    const truncateDesc = (text: string, maxLength: number): string => {
        if (text.length <= maxLength) {
            return text;
        }
        return text.slice(0, 12) + '...';
    };


    const truncateName = (text: string, maxLength: number): string => {
        if (text.length <= maxLength) {
            return text;
        }
        return text.slice(0, 16) + '...';
    };

    const handleEdit = (movieId:string) => {
        router.push(`/private/admin/${movieId}`);
    }


    const handleDelete = async (movieId: string) => {
        try {
            const response = await fetch(`/api/movies/${movieId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setMovies(movies.filter(movie => movie.movieId !== movieId));
            } else {
                console.error('Failed to delete the movie');
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
        }
    };
    
    
    return (
        <div className="admin-wrapper">
            <div className={"admin-container"}>
                <div className={"admin-box"}>
                    <div className={"upper-admin-box"}>
                        <div className={"upper-box"}>
                            <h2 className={"ml-8"}>Admin Panel</h2>
                            <Link href={"/private/admin/addmovies"} className={"h-full"}><button className={"admin-add-button"}><span className="material-symbols-outlined text-white">add</span></button></Link>
                        </div>
                    </div>
                    <div className={"admin-box-mid"}>
                        {movies
                            // @ts-ignore
                            .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))
                            .map(movie => (
                                <div key={movie.movieId}>
                                    <div className={"admin-item"}>
                                        <div className={"admin-item-left"}>
                                            <div className={"admin-items"}>{truncateName(movie.movieName, 16)}</div>
                                            <Divider orientation="vertical" className={"admin-divider"} />
                                            <div className={"admin-items"}>{movie.type === true ? "Movie" : "Tv Series"}</div>
                                            <Divider orientation="vertical" className={"admin-divider"} />
                                            <div className={"admin-items"}>{truncateDesc(movie.movieDesc, 12)}</div>
                                            <Divider orientation="vertical" className={"admin-divider"} />
                                            <div className={"admin-items"}>{formatDate(movie.releaseDate)}</div>
                                            <Divider orientation="vertical" className={"admin-divider"} />
                                        </div>
                                        <div className={"admin-item-right"}>
                                            <button onClick={() => handleEdit(movie.movieId)} className={"hover:text-blue-700"}>
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <Divider orientation="vertical" className={"admin-divider"} />
                                            <button onClick={() => handleDelete(movie.movieId)} className={"hover:text-red-700"}>
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className={"flex justify-center"}>
                                        <Divider orientation="horizontal" className={"admin-h-divider"} />
                                    </div>
                                </div>
                            ))}
                    </div>
                    <div className={"lower-admin-box"}></div>
                </div>
            </div>
        </div>
    );
};

