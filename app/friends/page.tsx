'use client';
import '@/app/friends/friend.css';
import React, { useEffect, useState } from 'react';
import { Divider } from "@nextui-org/divider";
import { useSession } from "next-auth/react";
import Link from 'next/link'
import CircularProgress from "@/components/circularProgress";
import SearchUser from "@/components/searchUser";

interface friends {
    friendId: string,
    userId1: string,
    userId2: string,
    createdAt: Date,
    status: boolean
}

interface User {
    userid: string;
    username: string;
    userdesc: string;
    userpic: string;
}
interface FollowedMovie {
    movieId: string;
    followedAt: Date;
    userId: string; 
}




export default function FriendPage() {
    const { data: session } = useSession();
    const [friends,setFriends] = useState<friends[]>([])
    const [friendRequests,setFriendRequests] = useState<friends[]>([])
    const [userDetailsMap, setUserDetailsMap] = useState<{ [key: string]: User }>({});
    const [followedMoviesMap, setFollowedMoviesMap] = useState<FollowedMovie[]>([]);
    const [movieName,setMovieName]= useState<string>('')
    const [isLoading, setIsLoading] = useState(true);
    


    useEffect(() => {
        async function getFriends() {
            try {
                const response = await fetch('/api/friends/listfriends', {
                    method: 'GET',
                });
                const data = await response.json();

                setFriends(data.friends);
                setFriendRequests(data.friendRequests);
                setFollowedMoviesMap(data.followedMovies)

                fetchAllFriendsAndRequestsDetails(data.friends, data.friendRequests);
            } catch (error) {
                console.log(error);
            }
        }

        async function fetchUserDetails(userId: string) {
            try {
                const response = await fetch(`/api/friends/findfriend/${userId}`);
                const user = await response.json();
                return user;
            } catch (error) {
                console.error('Error fetching user details:', error);
                return null;
            }
        }

        async function fetchAllFriendsAndRequestsDetails(friendsList: friends[], requestsList: friends[]) {
            const userDetails: { [key: string]: User } = {};
            const allFriendsAndRequests = [...friendsList, ...requestsList];

            for (const friend of allFriendsAndRequests) {
                const userId = session?.user?.userid === friend.userId1 ? friend.userId2 : friend.userId1;
                if (!userDetails[userId]) {
                    const userDetail = await fetchUserDetails(userId);
                    if (userDetail) {
                        userDetails[userId] = userDetail;
                    }
                }
            }
            setUserDetailsMap(userDetails);
        }
        
        setIsLoading(false)
        getFriends();
    }, [session?.user?.userid]);
    const truncateDesc = (text: string, maxLength: number): string => {
        if (!text) return ''; 
        if (text.length <= maxLength) {
            return text;
        }
        return text.slice(0, 48) + '...';
    };

    const truncateActivity = (text: string, maxLength: number): string => {
        if (!text) return '';
        if (text.length <= maxLength) {
            return text;
        }
        return text.slice(0, 16) + '..';
    };
    

    const handleDeleteRequest = async (username: string) => {
        try {
            const response = await fetch(`/api/friends/addfriend/${username}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setFriendRequests(friendRequests.filter(friendRequest => {
                    const userId = session?.user?.id === friendRequest.userId1 ? friendRequest.userId2 : friendRequest.userId1;
                    return userDetailsMap[userId]?.username !== username;
                }));
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteFriend = async (username: string) => {
        const confirmDelete = window.confirm(`Are you sure you want to remove ${username} from your friends?`);

        if (!confirmDelete) {
            return; 
        }
        try {
            const response = await fetch(`/api/friends/addfriend/${username}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setFriends(friends.filter(friend => {
                    const userId = session?.user?.userid === friend.userId1 ? friend.userId2 : friend.userId1;
                    return userDetailsMap[userId]?.username !== username;
                }));
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleAcceptRequest = async (username: string) => {
        try {
            const response = await fetch(`/api/friends/addfriend/${username}`, {
                method: 'POST'
            });
            if (response.ok) {
                const acceptedFriendRequest = friendRequests.find(friend => {
                    const userId = session?.user?.userid === friend.userId1 ? friend.userId2 : friend.userId1;
                    return userDetailsMap[userId]?.username === username;
                });
                // @ts-ignore
                setFriendRequests(friendRequests.filter(friend => friend.friendId !== acceptedFriendRequest.friendId));
                // @ts-ignore
                setFriends([...friends, acceptedFriendRequest]);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const renderMovieName = async (movieId: string) => {
        const movieName = await getMovieName(movieId);
        return truncateActivity(movieName, 16);
    };
    
    const getMovieName = async (movieid: string) => {
        try{
            const response = await fetch(`/api/friends/getfriendmovies/${movieid}`,{
                method: 'GET',
            })
            const data = await response.json()
            if (data.movie) {
                return data.movie.movieName; 
            } else {
                return 'Movie not found';
            }        }
        catch(error){
            console.log(error)
        }
    }


    if (isLoading) {
        return (
            <div className="flex w-full h-screen text-white justify-center items-center">
                <CircularProgress/>
            </div>
        );
    }
    
    return (
        <div className="friends-wrapper">
            <div className="friends-container">
                {followedMoviesMap.length > 0 &&(
                <div className="friends-activities">
                    <div className="slider-container">
                        <div className="slider-track">
                            {followedMoviesMap.map((movie) => {
                                const userDetail = userDetailsMap[movie.userId];
                                if (!userDetail) return null;
                                return (
                                    <div className="friend-activity" key={`${movie.movieId}-${movie.userId}`}>
                                        <img
                                            src={`/images/profilepictures/${userDetail.userpic}`}
                                            className="object-fill rounded-full w-14 h-14 mt-2 ml-2"
                                            alt="profile"
                                        />
                                        <div className="ml-4 mt-2">
                                            <h1 className="text-xl">{userDetail.username}</h1>
                                            <p className="text-sm opacity-70">Followed:</p>
                                            <p className="text-sm opacity-70">{renderMovieName(movie.movieId)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="slider-fade-effect"></div>
                    </div>
                </div>
                )}
                <div className="flex justify-center items-center">
                    <Divider orientation="horizontal" className="friends-h-divider"/>
                </div>
                {friendRequests.length === 0 ? (
                    <div className={"flex justify-center items-center"}>
                        <h1 className={"opacity-70 text-2xl"}>You don`t have any CineMate requests :(</h1>
                    </div>
                ) : (
                <div className="friends-requests">
                    
                        {friendRequests.map(friend => {
                            const userDetail = userDetailsMap[friend.userId2];

                            if (!userDetail) return null;

                            return (
                                <div className={"friend-request"} key={friend.friendId}>
                                    <div className={"flex"}>
                                        <img
                                            src={`/images/profilepictures/${userDetail.userpic}`}
                                            className="object-fill rounded-full w-10 h-10 mt-2 ml-2"
                                            alt="profile"
                                        />
                                        <h1 className={"mt-3 ml-6 text-xl"}>{userDetail.username}</h1>
                                    </div>
                                    <div>
                                        <button onClick={() => handleAcceptRequest(userDetail.username)}
                                                className={"friend-request-button fr-left"}>
                                            <span className="material-symbols-outlined">check</span>
                                        </button>
                                        <button onClick={() => handleDeleteRequest(userDetail.username)}
                                                className={"friend-request-button fr-right"}>
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    
                </div>
                        )}
                <div className="flex justify-center items-center">
                    <Divider orientation="horizontal" className="friends-h-divider"/>
                </div>
                <div className={"flex m-4"}>
                    <h1 className={"text-xl "}>Search for Your CineMate</h1>
                    <SearchUser/>
                </div>
                {friends.length === 0 ? (
                        <div className={"h-96 flex items-center justify-center"}>
                            <h1 className={"text-3xl opacity-70"}>You don`t have any CineMates</h1>
                        </div>
                ):(
                    <div className="friends-lists">
                    
                        
                    
                    {friends.map(friend => {
                        const userId = session?.user?.userid === friend.userId1 ? friend.userId2 : friend.userId1;
                        const userDetail = userDetailsMap[userId];


                        if (!userDetail) return null;

                        return (
                            <div className={"friend-list"} key={friend.friendId}>
                                <span onClick={() => handleDeleteFriend(userDetail.username)} className="material-symbols-outlined friend-remove">block</span>
                                <Link className={"frnd-list-link"} href={`/private/userprofile/${userDetail.username}`}>
                                    <img
                                        src={`/images/profilepictures/${userDetail.userpic}`}
                                        className="object-fill rounded-full w-16 h-16 mt-2 ml-2"
                                        alt="profile"
                                    />
                                    <div className="ml-4 mt-2 w-36">
                                        <h1 className="text-xl">{userDetail?.username}</h1>
                                        {userDetail.userdesc && (
                                            <p className="text-sm opacity-70">{truncateDesc(userDetail.userdesc as string, 48)}</p>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        )
                    })}


                    </div>
                )}
            </div>
        </div>
    );
}