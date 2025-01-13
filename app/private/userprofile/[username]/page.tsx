'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Divider } from "@nextui-org/divider";
import Link from "next/link";
import CircularProgress from "@/components/circularProgress";


interface User {
    password: string;
    isAdmin: boolean;
    userid: string;
    email: string;
    username: string;
    createdAt: Date;
    birthday: Date;
    userdesc: string;
    userpic: string;
    userbg: string;
    favsecure: boolean;
    prfsecure: boolean;
}

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

interface Friend {
    friendId: string;
    userId1: string;
    userId2: string;
}

export default function Profile() {
    const { data: session } = useSession();
    const pathName = usePathname();
    const userIdFromUrl = pathName.split('/').pop();
    const [userDetails, setUserDetails] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [userDetailsMap, setUserDetailsMap] = useState<{ [key: string]: User }>({});
    const [tvShows, setTvShows] = useState<Movie[]>([]);
    const [favoriteShows, setFavoriteShows] = useState<Movie[]>([]);
    const [isEditVisible, setIsEditVisible] = useState(false);
    const [isEditTvVisible, setIsEditTvVisible] = useState(false);
    const [isEditFavVisible, setIsEditFavVisible] = useState(false);
    const [favoriteMovies, setFavoriteMovies] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCineMate,setIsCineMate] = useState('')
    const [friendNumber,setFriendNumber] = useState(0)

    
    
    
    const handleEdit = () => {
        setIsEditVisible((prev) => !prev);
    };
    const handleEditTv = () => {
        setIsEditTvVisible((prev) => !prev);
    };
    const handleEditFav = () => {
        setIsEditFavVisible((prev) => !prev);
    };

    const fetchFavoriteMovies = async (username: string) => {
        try {
            const response = await fetch(`/api/profile/${username}/movies/favorite`);
            if (!response.ok) throw new Error('Failed to fetch favorite movies');
            const data = await response.json();
            console.log('Favorite Movies:', data.movies);
            setFavoriteMovies(data.movies.map((movie: Movie) => movie.movieId));
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (userDetails?.username) {
            fetchFavoriteMovies(userDetails.username);
        }
    }, [userDetails]);
    
    
    useEffect(() => {
        const fetchUserDetails = async (username: string) => {
            try {
                console.log('Fetching user details for name:', username);
                const response = await fetch(`/api/profile/${username}`);
                if (!response.ok) throw new Error('User not found');
                const user = await response.json();
                return user;
            } catch (err: any) {
                throw new Error(err.message);
            }
        };

        if (userIdFromUrl) {
            fetchUserDetails(userIdFromUrl)
                .then((user) => {
                    console.log('Fetched user details:', user);
                    setUserDetails(user);
                })
                .catch((err) => {
                    setError(err.message);
                });
        } else if (session) {
            setUserDetails(session.user as User);
        }
    }, [session, userIdFromUrl]);

    useEffect(() => {
        const fetchFavoriteMovies = async (username: string) => {
            try {
                const response = await fetch(`/api/profile/${username}/movies/`);
                if (!response.ok) throw new Error('User not found');
                const data = await response.json();
                setFavoriteShows(data.favoriteMovies)
            } catch (error) {
                console.log(error);
            }
        };

        fetchFavoriteMovies(userDetails?.username as string)
        
    }, [userDetails]);
    
    useEffect(() => {
        const fetchFollowedMovies = async (username: string) => {
            try {
                const response = await fetch(`/api/profile/${username}/movies`);
                if (!response.ok) throw new Error('User not found');
                const data = await response.json();
                const filteredMovies = data.followedMovies.filter((movie: Movie) => movie.type === true)
                const filteredTvShows = data.followedMovies.filter((movie: Movie) => movie.type === false)
                setMovies(filteredMovies);
                setTvShows(filteredTvShows)
            } catch (error) {
                console.log(error);
            }
            finally{
                setIsLoading(false)
            }
        };

        if (userDetails?.username) {
            fetchFollowedMovies(userDetails.username);
        }
    }, [userDetails]);

    useEffect(() => {
        const fetchFriendDetails = async(username: string) => {
            if (!username) return;

            try {
                const response = await fetch(`/api/friends/addfriend/${username}`, {
                    method: 'GET'
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsCineMate(data.message);
                } else {
                    const errorData = await response.json();
                    console.error('Failed to fetch friend details:', errorData.error);
                }
            } catch (error) {
                console.error('Failed to send request:', error);
            }
        };

        if (userDetails?.username) {
            fetchFriendDetails(userDetails.username);
        }
    }, [userDetails?.username]);
    
    const sendFriendRequest = async(userId: string) => {
        try{
            const response = await fetch(`/api/friends/addfriend/${userDetails?.username}`,{
                method: 'POST'
            })
            if (response.ok) {
                const data = await response.json();
                console.log('Request sent!!');
                setIsCineMate(data.message);
            } else {
                const errorData = await response.json();
                console.error('Failed to send request:', errorData.message);
            }
        }
        catch(error){
            console.log(error)
        }
    }

    useEffect(() => {
        const fetchFriends = async (username: string,userid: string) => {
            try {
                const response = await fetch(`/api/profile/${username}/friends`);
                if (!response.ok) throw new Error('Failed to fetch friends');
                const data = await response.json();
                setFriends(data.friends);
                setFriendNumber(data.numfriends);

                const userDetails: { [key: string]: User } = {};
                for (const friend of data.friends) {
                    const friendId = friend.userId1 === userid ? friend.userId2 : friend.userId1;
                    if (!userDetails[friendId]) {
                        const userDetailResponse = await fetch(`/api/friends/findfriend/${friendId}`);
                        const userDetail = await userDetailResponse.json();
                        if (userDetail) {
                            userDetails[friendId] = userDetail;
                        }
                    }
                }
                setUserDetailsMap(userDetails);
            } catch (error) {
                console.log(error);
            }
        };

        if (userDetails?.userid) {
            fetchFriends(userDetails.username,userDetails.userid);
        }
    }, [userDetails?.userid]);

    useEffect(() => {
        if (userDetails?.username) {
            fetchFavoriteMovies(userDetails.username);
        }
    }, [userDetails]);
    
    const handleDeleteFollowed = async (movieId: string) =>{
        try{
            const response = await fetch(`/api/profile/${userDetails?.username}/movies/${movieId}`,{
                method: 'DELETE',
            })
            if (response.ok) {
                if (isEditVisible) {
                    setMovies(movies.filter(movie => movie.movieId !== movieId));
                    setFavoriteShows(favoriteShows.filter(movie => movie.movieId !== movieId))
                } else if (isEditTvVisible) {
                    setTvShows(tvShows.filter(tvShow => tvShow.movieId !== movieId));
                    setFavoriteShows(favoriteShows.filter(movie => movie.movieId !== movieId))
                }       
            }
            else {
                console.error('Failed to delete the movie');
            }        
        }
        catch (error){
            console.log(error)
        }
    }

    const handleFavorite = async (movieId: string) => {
        try {
            const response = await fetch(`/api/profile/${userDetails?.username}/movies/${movieId}`, {
                method: 'POST',
            });

            if (response.ok) {
                const isAlreadyFavorite = favoriteMovies.includes(movieId);

                if (isAlreadyFavorite) {
                    setFavoriteMovies(favoriteMovies.filter(id => id !== movieId));
                    setFavoriteShows(favoriteShows.filter(movie => movie.movieId !== movieId));
                } else {
                    setFavoriteMovies([...favoriteMovies, movieId]);

                    const newFavoriteMovie = movies.find(movie => movie.movieId === movieId) ||
                        tvShows.find(movie => movie.movieId === movieId);

                    if (newFavoriteMovie) {
                        setFavoriteShows([...favoriteShows, newFavoriteMovie]); 
                    }
                }
            } else {
                console.error('Failed to toggle the movie favorite status');
            }
        } catch (error) {
            console.log(error);
        }
    };
    const accountAge = (dateString: string): string => {
        const date: Date = new Date(dateString);
        const now: Date = new Date();
        const seconds: number = Math.floor((now.getTime() - date.getTime()) / 1000);
        let interval: number;

        interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return interval + " year" + (interval > 1 ? "s" : "");

        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return interval + " month" + (interval > 1 ? "s" : "");

        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return interval + " day" + (interval > 1 ? "s" : "");

        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval + " hour" + (interval > 1 ? "s" : "");

        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval + " minute" + (interval > 1 ? "s" : "");

        return "just now";
    };
    
    
    const profileImg = userDetails?.userpic;
    const profileImgURL = profileImg ? `/images/profilepictures/${profileImg}` : '';
    
    if (isLoading) {
        return (
            <div className="flex w-full h-screen text-white justify-center items-center">
                <CircularProgress/>
            </div>
        );
    }

    return (
        <div className={"prf-back"}>
            <div className="text-white profile-wrapper">
                {error ? (
                    <div className="text-center">
                        <h1 className={"text-2xl"}>{error}</h1>
                    </div>
                ) : (
                    <div className={`profile-container ${userDetails?.userbg}`}>
                        <div className={"profile-container-upper"}>
                            <div className={"upper-left"}>
                                <div className={"prf-name"}>{userDetails?.username}</div>
                                <div className={"prf-desc"}>{userDetails?.userdesc}</div>
                            </div>
                            <div className={"upper-right flex justify-end items-end"}>
                                {session?.user?.name !== userDetails?.username && (
                                    <>
                                {userDetails?.userbg === 'bg3' || userDetails?.userbg === 'bg4' || userDetails?.userbg === 'bg5' || userDetails?.userbg === 'bg6' || userDetails?.userbg === 'bg7' ? (
                                    // @ts-ignore
                                    <button disabled={isCineMate === 'Friend request is pending'} onClick={sendFriendRequest} className={"friend-request-button-l"}>{isCineMate || 'Add as CineMate'}</button>
                                ) : (
                                    // @ts-ignore
                                    <button disabled={isCineMate === 'Friend request is pending'} onClick={sendFriendRequest} className={"friend-request-button-d"}>{isCineMate || 'Add as CineMate'}</button>
                                        )}
                                    </>
                                    )}
                                    <div className={"profile-image "}>
                                    <img className={"rounded"} src={profileImgURL} alt="User profile" />
                                </div>
                            </div>
                        </div>
                        {userDetails?.userbg === 'bg3' || userDetails?.userbg === 'bg4' || userDetails?.userbg === 'bg5' || userDetails?.userbg === 'bg6' || userDetails?.userbg === 'bg7' ? (

                                <div className={"flex"}>
                                    <div className={"divider-light"}></div>
                                </div>
                            ): (
                            <div className={"flex"}>
                                <div className={"divider"}></div>
                            </div>
                        )}
                        {session?.user?.userid !== userDetails?.userid && userDetails?.prfsecure ? (
                            <div className={"flex w-full h-48 justify-center items-center"}>
                                <h1 className={"text-3xl"}>This profile is private</h1>
                            </div>
                        ): (
                            <div className={"profile-lower"}>
                                <div className={"profile-lower-left"}>
                                    {userDetails?.userbg === 'bg3' || userDetails?.userbg === 'bg4' || userDetails?.userbg === 'bg5' || userDetails?.userbg === 'bg6' || userDetails?.userbg === 'bg7' ? (
                                        <div>
                                            {!userDetails.favsecure && (
                                                <div className={"profile-lowerb-container"}>
                                                    <div className={"flex justify-between"}>
                                                        <h1 className={"text-3xl ml-4 mt-4"}>Favorite Shows</h1>
                                                        {session?.user?.name === userDetails?.username && (
                                                            <button onClick={() => handleEditFav()}
                                                                    className={"hover:text-blue-400 mt-4 mr-4"}>
                                                                <span className="material-symbols-outlined">edit</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <Divider orientation="horizontal"
                                                             className={"w-full h-0.5 bg-gray-200"}/>
                                                    <div className="movie-slider">
                                                        <div className="movie-slider-track">
                                                            {favoriteShows.map(movie => (
                                                                <div key={movie.movieId} className="slider-img">
                                                                    <img
                                                                        src={`/images/movie_banners/${movie.movieBanner}`}
                                                                        alt={`image`}
                                                                        className={"object-fill w-full h-full"}
                                                                    />
                                                                    <div className={"overlay-prf"}>
                                                                        <div className={"overlay-button-prf"}>
                                                                            <div
                                                                                className={"flex justify-center items-center"}>
                                                                                <Divider orientation="horizontal"
                                                                                         className={"overlay1-h-divider-prf"}/>
                                                                            </div>
                                                                            <Link className={"overlay-link-prf"}
                                                                                  href={`/details/${movie.movieId}`}>Inspect</Link>
                                                                            <div
                                                                                className={"flex justify-center items-center"}>
                                                                                <Divider orientation="horizontal"
                                                                                         className={"overlay2-h-divider-prf"}/>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className={"profile-lowerb-container"}>
                                                <div className={"flex justify-between"}>
                                                    <h1 className={"text-3xl ml-4 mt-4"}>Followed Movies</h1>
                                                    {session?.user?.name === userDetails?.username && (
                                                        <button onClick={() => handleEdit()}
                                                                className={"hover:text-blue-400 mt-4 mr-4"}>
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </button>
                                                    )}
                                                </div>
                                                <Divider orientation="horizontal"
                                                         className={"w-full h-0.5 bg-gray-200"}/>
                                                <div className="movie-slider">
                                                    <div className="movie-slider-track">
                                                        {movies.map(movie => (
                                                            <div key={movie.movieId} className="slider-img">
                                                                <img
                                                                    src={`/images/movie_banners/${movie.movieBanner}`}
                                                                    alt={`image`}
                                                                    className={"object-fill w-full h-full"}
                                                                />
                                                                <div className={"overlay-prf"}>
                                                                    <div className={"overlay-button-prf"}>
                                                                        <div
                                                                            className={"flex justify-center items-center"}>
                                                                            <Divider orientation="horizontal"
                                                                                     className={"overlay1-h-divider-prf"}/>
                                                                        </div>
                                                                        <Link className={"overlay-link-prf"}
                                                                              href={`/details/${movie.movieId}`}>Inspect</Link>
                                                                        <div
                                                                            className={"flex justify-center items-center"}>
                                                                            <Divider orientation="horizontal"
                                                                                     className={"overlay2-h-divider-prf"}/>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={"profile-lowerb-container"}>
                                                <div className={"flex justify-between"}>
                                                    <h1 className={"text-3xl ml-4 mt-4"}>Followed Tv Shows</h1>
                                                    {session?.user?.name === userDetails?.username && (
                                                        <button onClick={() => handleEditTv()}
                                                                className={"hover:text-blue-400 mt-4 mr-4"}>
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </button>
                                                    )}
                                                </div>
                                                <Divider orientation="horizontal"
                                                         className={"w-full h-0.5 bg-gray-200"}/>
                                                <div className="movie-slider">
                                                    <div className="movie-slider-track">
                                                        {tvShows.map(movie => (
                                                            <div key={movie.movieId} className="slider-img">
                                                                <img
                                                                    src={`/images/movie_banners/${movie.movieBanner}`}
                                                                    alt={`image`}
                                                                    className={"object-fill w-full h-full"}
                                                                />
                                                                <div className={"overlay-prf"}>
                                                                    <div className={"overlay-button-prf"}>
                                                                        <div
                                                                            className={"flex justify-center items-center"}>
                                                                            <Divider orientation="horizontal"
                                                                                     className={"overlay1-h-divider-prf"}/>
                                                                        </div>
                                                                        <Link className={"overlay-link-prf"}
                                                                              href={`/details/${movie.movieId}`}>Inspect</Link>
                                                                        <div
                                                                            className={"flex justify-center items-center"}>
                                                                            <Divider orientation="horizontal"
                                                                                     className={"overlay2-h-divider-prf"}/>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {!userDetails?.favsecure && (
                                                <div className={"profile-lower-container"}>
                                                    <div className={"flex justify-between"}>
                                                        <h1 className={"text-3xl ml-4 mt-4"}>Favorite Shows</h1>
                                                        {session?.user?.name === userDetails?.username && (
                                                            <button onClick={() => handleEditFav()}
                                                                    className={"hover:text-blue-700 mt-4 mr-4"}>
                                                                <span className="material-symbols-outlined">edit</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <Divider orientation="horizontal"
                                                             className={"w-full h-0.5 bg-gray-700"}/>
                                                    <div className="movie-slider">
                                                        <div className="movie-slider-track">
                                                            {favoriteShows.map(movie => (
                                                                <div key={movie.movieId} className="slider-img">
                                                                    <img
                                                                        src={`/images/movie_banners/${movie.movieBanner}`}
                                                                        alt={`image`}
                                                                        className={"object-fill w-full h-full"}
                                                                    />
                                                                    <div className={"overlay-prf"}>
                                                                        <div className={"overlay-button-prf"}>
                                                                            <div
                                                                                className={"flex justify-center items-center"}>
                                                                                <Divider orientation="horizontal"
                                                                                         className={"overlay1-h-divider-prf"}/>
                                                                            </div>
                                                                            <Link className={"overlay-link-prf"}
                                                                                  href={`/details/${movie.movieId}`}>Inspect</Link>
                                                                            <div
                                                                                className={"flex justify-center items-center"}>
                                                                                <Divider orientation="horizontal"
                                                                                         className={"overlay2-h-divider-prf"}/>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className={"profile-lower-container"}>
                                                <div className={"flex justify-between"}>
                                                    <h1 className={"text-3xl ml-4 mt-4"}>Followed Movies</h1>
                                                    {session?.user?.name === userDetails?.username && (
                                                        <button onClick={() => handleEdit()}
                                                                className={"hover:text-blue-700 mt-4 mr-4"}>
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </button>
                                                    )}
                                                </div>
                                                <Divider orientation="horizontal"
                                                         className={"w-full h-0.5 bg-gray-700"}/>
                                                <div className="movie-slider">
                                                    <div className="movie-slider-track">
                                                        {movies.map(movie => (
                                                            <div key={movie.movieId} className="slider-img">
                                                                <img
                                                                    src={`/images/movie_banners/${movie.movieBanner}`}
                                                                    alt={`image`}
                                                                    className={"object-fill w-full h-full"}
                                                                />
                                                                <div className={"overlay-prf"}>
                                                                    <div className={"overlay-button-prf"}>
                                                                        <div
                                                                            className={"flex justify-center items-center"}>
                                                                            <Divider orientation="horizontal"
                                                                                     className={"overlay1-h-divider-prf"}/>
                                                                        </div>
                                                                        <Link className={"overlay-link-prf"}
                                                                              href={`/details/${movie.movieId}`}>Inspect</Link>
                                                                        <div
                                                                            className={"flex justify-center items-center"}>
                                                                            <Divider orientation="horizontal"
                                                                                     className={"overlay2-h-divider-prf"}/>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={"profile-lower-container"}>
                                                <div className={"flex justify-between"}>
                                                    <h1 className={"text-3xl ml-4 mt-4"}>Followed Tv Shows</h1>
                                                    {session?.user?.name === userDetails?.username && (
                                                        <button onClick={() => handleEditTv()}
                                                                className={"hover:text-blue-700 mt-4 mr-4"}>
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </button>
                                                    )}
                                                </div>
                                                <Divider orientation="horizontal"
                                                         className={"w-full h-0.5 bg-gray-700"}/>
                                                <div className="movie-slider">
                                                    <div className="movie-slider-track">
                                                        {tvShows.map(movie => (
                                                            <div key={movie.movieId} className="slider-img">
                                                                <img
                                                                    src={`/images/movie_banners/${movie.movieBanner}`}
                                                                    alt={`image`}
                                                                    className={"object-fill w-full h-full"}
                                                                />
                                                                <div className={"overlay-prf"}>
                                                                    <div className={"overlay-button-prf"}>
                                                                        <div
                                                                            className={"flex justify-center items-center"}>
                                                                            <Divider orientation="horizontal"
                                                                                     className={"overlay1-h-divider-prf"}/>
                                                                        </div>
                                                                        <Link className={"overlay-link-prf"}
                                                                              href={`/details/${movie.movieId}`}>Inspect</Link>
                                                                        <div
                                                                            className={"flex justify-center items-center"}>
                                                                            <Divider orientation="horizontal"
                                                                                     className={"overlay2-h-divider-prf"}/>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>


                                <div className={"profile-lower-right"}>
                                    {userDetails?.userbg === 'bg3' || userDetails?.userbg === 'bg4' || userDetails?.userbg === 'bg5' || userDetails?.userbg === 'bg6' || userDetails?.userbg === 'bg7' ? 
                                        (
                                            <div className={"friend-profile-light-container"}>
                                                <div className={"cinemates-title"}>
                                                    <Link href="/friends">
                                                        <h1 className="text-xl font-bold cursor-pointer hover:brightness-90">Cinemates
                                                            ({friendNumber})</h1>
                                                    </Link>
                                                </div>
                                                <div className={"cinemates-container"}>
                                                    {friends.slice(0, 5).map(friend => {
                                                        const userId = userDetails?.userid === friend.userId1 ? friend.userId2 : friend.userId1;
                                                        const userDetail = userDetailsMap[userId];
                                                        if (!userDetail) return null;
                                                        return (
                                                            <Link href={`/private/userprofile/${userDetail.username}`}>
                                                            <div key={friend.friendId} className={"cinemate-item"}>
                                                                <img
                                                                    src={`/images/profilepictures/${userDetail.userpic}`}
                                                                    className="rounded-full w-12 h-12"
                                                                    alt="Cinemate profile"
                                                                />
                                                                <h2 className="ml-4 text-sm font-semibold">{userDetail.username}</h2>
                                                            </div>
                                                            </Link>
                                                        );
                                                    })}
                                                    {friends.length === 0 && (
                                                        <p className="text-sm opacity-70">No Cinemates yet</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (

                                            <div className={"friend-profile-container"}>
                                                <div className={"cinemates-title"}>
                                                    <Link href="/friends">
                                                        <h1 className="text-xl font-bold cursor-pointer hover:brightness-75">Cinemates
                                                            ({friendNumber})</h1>
                                                    </Link>
                                                </div>
                                                <div className={"cinemates-container"}>
                                                    {friends.slice(0, 5).map(friend => {
                                                        const userId = userDetails?.userid === friend.userId1 ? friend.userId2 : friend.userId1;
                                                        const userDetail = userDetailsMap[userId];
                                                        if (!userDetail) return null;
                                                        return (
                                                            <Link href={`/private/userprofile/${userDetail.username}`}>
                                                            <div key={friend.friendId} className={"cinemate-item"}>
                                                                <img
                                                                    src={`/images/profilepictures/${userDetail.userpic}`}
                                                                    className="rounded-full w-12 h-12"
                                                                    alt="Cinemate profile"
                                                                />
                                                                <h2 className="ml-4 text-sm font-semibold">{userDetail.username}</h2>
                                                            </div>
                                                            </Link>
                                                        );
                                                    })}
                                                    {friends.length === 0 && (
                                                        <p className="text-sm opacity-70">No Cinemates yet</p>
                                                    )}
                                    </div>
                                </div>
                                        )}
                                </div>
                            </div>
                        )}

                        {isEditVisible && (
                            <div className="edit-page-overlay">
                                <div className="edit-page">
                                    <h2 className="text-2xl mb-4">Edit Followed Movies</h2>
                                    <Divider orientation="horizontal" className={"w-full h-0.5 bg-gray-700"}/>
                                    <div className="movie-edit-list">
                                        {movies.map(movie => (
                                            <div key={movie.movieId} className="edit-movie-item">
                                                <span>{movie.movieName}</span>
                                                <div className={"flex"}>
                                                    <button
                                                        onClick={() => handleFavorite(movie.movieId)}
                                                        className={`edit-movie-icon favorite ${favoriteMovies.includes(movie.movieId) ? 'text-red-500' : ''}`}
                                                    >
                                                        <span className="material-symbols-outlined">favorite</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteFollowed(movie.movieId)}
                                                            className="edit-movie-icon ml-6">
                                                        <span className="material-symbols-outlined">close</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={handleEdit} className="close-edit-page">Close</button>
                                </div>
                            </div>
                        )}
                        {isEditTvVisible && (
                            <div className="edit-page-overlay">
                                <div className="edit-page">
                                    <h2 className="text-2xl mb-4">Edit Followed Tv Shows</h2>
                                    <Divider orientation="horizontal" className={"w-full h-0.5 bg-gray-700"}/>
                                    <div className="movie-edit-list">
                                        {tvShows.map(movie => (
                                            <div key={movie.movieId} className="edit-movie-item">
                                                <span>{movie.movieName}</span>
                                                <div className={"flex"}>
                                                    <button
                                                        onClick={() => handleFavorite(movie.movieId)}
                                                        className={`edit-movie-icon favorite ${favoriteMovies.includes(movie.movieId) ? 'text-red-500' : ''}`}  // Use per-movie isLiked
                                                    >
                                                        <span className="material-symbols-outlined">favorite</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteFollowed(movie.movieId)}
                                                            className="edit-movie-icon ml-6">
                                                        <span className="material-symbols-outlined">close</span>
                                                </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={handleEditTv} className="close-edit-page">Close</button>
                                </div>
                            </div>
                        )}
                        {isEditFavVisible && (
                            <div className="edit-page-overlay">
                                <div className="edit-page">
                                    <h2 className="text-2xl mb-4">Edit Favorite</h2>
                                    <Divider orientation="horizontal" className={"w-full h-0.5 bg-gray-700"}/>
                                    <div className="movie-edit-list">
                                        {favoriteShows.map(movie => (
                                            <div key={movie.movieId} className="edit-movie-item">
                                                <span>{movie.movieName}</span>
                                                <div className={"flex"}>
                                                    <button
                                                        onClick={() => handleFavorite(movie.movieId)}
                                                        className={`edit-movie-icon favorite ${favoriteMovies.includes(movie.movieId) ? 'text-red-500' : ''}`}  // Use per-movie isLiked
                                                    >
                                                        <span className="material-symbols-outlined">favorite</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={handleEditFav} className="close-edit-page">Close</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}