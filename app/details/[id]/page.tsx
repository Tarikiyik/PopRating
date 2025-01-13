'use client';
import React, { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import YouTubeEmbed from '@/components/YoutubeEmbed';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { useSession } from "next-auth/react";
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
    prequel: string;
    sequel: string;
}

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
}

interface Comments {
    commentId: string;
    userId: number;
    content: string;
    created_at: Date;
    movieId: string;
    username: string;
}

interface CommentWithAnimation extends Comments {
    animation?: boolean;
}

interface Actor {
    id: number;
    name: string;
    profile_path: string;
    character: string;
}

interface PlatformInfo {
    display_priority: number;
    logo_path: string;
    provider_id: number;
    provider_name: string;
}

interface MediaDetails {
    id: number;
    title: string;
    name: string;
    overview: string;
}

const locations = [
    { code: '', name: 'All' },
    { code: 'TR', name: 'Turkey' },
    { code: 'US', name: 'US' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'UK' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'AU', name: 'Australia' },
];

export default function EditMovie() {
    const [movie, setMovie] = useState<Movie | null>(null);
    const [prequelMovie, setPrequelMovie] = useState<Movie | null>(null);
    const [sequelMovie, setSequelMovie] = useState<Movie | null>(null);
    const [comment, setComment] = useState<Comments | null>(null);
    const [userDetailsMap, setUserDetailsMap] = useState<Record<string, any>>({});
    const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
    const [selectedTypeKeys, setSelectedTypeKeys] = useState(new Set<string>());
    const [selectedWatchTypeKeys, setSelectedWatchTypeKeys] = useState(new Set<string>());
    const [isSelected, setIsSelected] = useState(false);
    const [selectedRating, setSelectedRating] = useState(new Set<string>());
    const [selectedGenreKeys, setSelectedGenreKeys] = useState(new Set<string>());
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [releaseValue, setReleaseValue] = useState('');
    const [mediaDetails, setMediaDetails] = useState<MediaDetails | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
    const { id } = useParams();
    const [selectedLocation, setSelectedLocation] = useState<string>(locations[0].code);
    const { data: session } = useSession();
    const [buttonStatus, setButtonStatus] = useState<'initial' | 'success'>('initial');
    const [avgRating, setAvgRating] = useState(0);
    const [followedUsers, setFollowedUsers] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);
    const [ratingPosition, setRatingPosition] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [animateRating, setAnimateRating] = useState(false);
    const [animateUsers, setAnimateUsers] = useState(false);
    const [animateComment, setAnimateComment] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [commentValue, setCommentValue] = useState('');
    const [comments, setComments] = useState<CommentWithAnimation[]>([]);
    const [actors, setActors] = useState<Actor[]>([]);
    const [isLoading,setIsLoading] = useState(true)
    

    
    const selectedWatchTypeValue = React.useMemo(() => {
        return selectedWatchTypeKeys.size === 0
            ? 'Add to my list'
            : Array.from(selectedWatchTypeKeys).join(', ').replaceAll('_', ' ');
    }, [selectedWatchTypeKeys]);

    const selectedRatingValue = React.useMemo(() => {
        return selectedRating.size === 0
            ? 'Rate The show'
            : Array.from(selectedRating).join(', ').replaceAll('_', ' ');
    }, [selectedRating]);

    const handleSelected = () => {
        setIsSelected(true);
    };


    const handleDeleteComment = async (commentid: string) => {
        const showConfirmationDialog = (message:any, onCancel:any, onConfirm:any) => {
            const modalBackground = document.createElement('div');
            modalBackground.className = 'modal-background';

            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';

            const modalMessage = document.createElement('p');
            modalMessage.textContent = message;

            const cancelButton = document.createElement('button');
            cancelButton.className = 'modal-button';
            cancelButton.textContent = 'No';
            cancelButton.onclick = () => {
                document.body.removeChild(modalBackground);
                onCancel();
            };
            const confirmButton = document.createElement('button');
            confirmButton.className = 'modal-button modal-delete';
            confirmButton.textContent = 'Yes';
            confirmButton.onclick = () => {
                document.body.removeChild(modalBackground);
                onConfirm();
            };

            modalContent.appendChild(modalMessage);
            modalContent.appendChild(cancelButton);
            modalContent.appendChild(confirmButton);
            modalBackground.appendChild(modalContent);
            document.body.appendChild(modalBackground);
        };

        try {
            showConfirmationDialog(
                'Are you sure you want to delete your comment?',
                () => {
                    console.log('Deletion cancelled');
                },
                async () => {
                    setDeletingCommentId(commentid);
                    const response = await fetch(`/api/movies/comments/${commentid}`, {
                        method: 'DELETE',
                    });
                    if (response.ok) {
                        setTimeout(() => {
                            setComments(comments.filter(comment => comment.commentId !== commentid));
                            setDeletingCommentId(null);
                            fetchUpdatedCommentData();
                        }, 500); 
                    } else {
                        console.error('Failed to delete the comment');
                        setDeletingCommentId(null);
                    }
                }
            );
        } catch (error) {
            console.error('Error deleting comment:', error);
            setDeletingCommentId(null);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const ListType = selectedWatchTypeValue;
        const rating = selectedRatingValue;
        let ratingValue = parseInt(rating, 10);

        const formData = {
            rating: isNaN(ratingValue) ? null : ratingValue,
            followType: ListType,
        };

        const response = await fetch(`/api/movies/rating/${movie?.movieId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            console.log("Completed");
            setButtonStatus('success');
            fetchUpdatedData();
        }
    };

    const fetchUpdatedData = async () => {
        const response = await fetch(`/api/movies/rating/${id}`);
        const data = await response.json();
        setAnimateRating(true);
        setAnimateUsers(true);
        setTimeout(() => {
            setAvgRating(data.overallRating);
            setFollowedUsers(data.followCount);
            setRatingCount(data.ratingCount);
            setRatingPosition(data.ratingPosition)
        }, 300);
        setTimeout(() => {
            setAnimateRating(false);
            setAnimateUsers(false);
        }, 1000);
    };

    const fetchUpdatedCommentData = async () => {
        const response = await fetch(`/api/movies/comments/${id}`);
        const data = await response.json();
        setAnimateComment(true);
        setTimeout(() => {
            setCommentCount(data.commentCount);
        }, 300);
        setTimeout(() => {
            setAnimateComment(false);
        }, 1000);
    };

    useEffect(() => {
        setButtonStatus('initial');
    }, [selectedWatchTypeKeys, selectedRating]);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const movieResponse = await fetch(`/api/movies/${id}`);
                const movieData = await movieResponse.json();
                setMovie(movieData);
                setSelectedTypeKeys(new Set<string>([movieData.type ? 'Movie' : 'Tv Show']));
                setSelectedGenreKeys(new Set<string>(movieData.genre.split(', ')));
                setBannerImage(movieData.movieBanner);

                const searchType = movieData.type ? 'movie' : 'tv';
                const searchOptions = {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                    }
                };

                const searchResponse = await fetch(`https://api.themoviedb.org/3/search/${searchType}?query=${movieData.movieName}`, searchOptions);
                if (!searchResponse.ok) {
                    throw new Error(`Failed to search for ${searchType}: ${searchResponse.statusText}`);
                }
                const searchData = await searchResponse.json();
                if (searchData.results.length === 0) {
                    throw new Error(`${movieData.type ? 'Movie' : 'TV series'} not found`);
                }
                const mediaId = searchData.results[0].id;

                const mediaResponse = await fetch(`https://api.themoviedb.org/3/${searchType}/${mediaId}`, searchOptions);
                if (!mediaResponse.ok) {
                    throw new Error(`Failed to fetch ${searchType} details: ${mediaResponse.statusText}`);
                }
                const mediaData = await mediaResponse.json();
                setMediaDetails(mediaData);

                const actorResponse = await fetch(`https://api.themoviedb.org/3/${searchType}/${mediaId}/credits`, searchOptions);
                if (!actorResponse.ok) {
                    throw new Error(`Failed to fetch actors: ${actorResponse.statusText}`);
                }
                const actorData = await actorResponse.json();
                setActors(actorData.cast.map((actor: any) => ({
                    id: actor.id,
                    name: actor.name,
                    profile_path: actor.profile_path,
                    character: actor.character
                })));

                const ratingResponse = await fetch(`/api/movies/rating/${id}`);
                const ratingData = await ratingResponse.json();
                setAvgRating(ratingData.overallRating);
                setFollowedUsers(ratingData.followCount);
                setRatingCount(ratingData.ratingCount);
                setRatingPosition(ratingData.ratingPosition)

            } catch (error) {
                console.error("Error fetching movie", error);
                setError("Error fetching movie details");
            }
            finally {
                setIsLoading(false)
            }
        };
        fetchMovie();
    }, [id, selectedLocation]);
    
    useEffect(() => {
        async function fetchPlatforms() {
            try {
                const searchType = movie?.type ? 'movie' : 'tv';
                const mediaId = mediaDetails?.id;
                const searchOptions = {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                    }
                };

                const providerResponse = await fetch(`https://api.themoviedb.org/3/${searchType}/${mediaId}/watch/providers`, searchOptions);
                if (!providerResponse.ok) {
                    throw new Error(`Failed to fetch providers: ${providerResponse.statusText}`);
                }
                const providerData = await providerResponse.json();
                if (selectedLocation) {
                    if (providerData.results && providerData.results[selectedLocation] && providerData.results[selectedLocation].flatrate) {
                        setPlatforms(providerData.results[selectedLocation].flatrate.map((provider: any) => ({
                            display_priority: provider.display_priority,
                            logo_path: provider.logo_path,
                            provider_id: provider.provider_id,
                            provider_name: provider.provider_name
                        })));
                        setAvailabilityMessage(null);
                    } else {
                        setPlatforms([]);
                        setAvailabilityMessage('Not available in this country');
                    }
                } else {
                    const combinedPlatforms: PlatformInfo[] = [];
                    Object.keys(providerData.results).forEach(region => {
                        const regionPlatforms = providerData.results[region].flatrate || [];
                        regionPlatforms.forEach((provider: any) => {
                            if (!combinedPlatforms.some(p => p.provider_id === provider.provider_id)) {
                                combinedPlatforms.push({
                                    display_priority: provider.display_priority,
                                    logo_path: provider.logo_path,
                                    provider_id: provider.provider_id,
                                    provider_name: provider.provider_name
                                });
                            }
                        });
                    });
                    setPlatforms(combinedPlatforms);
                    setAvailabilityMessage(null);
                }
            } catch (error) {
                console.error("Error fetching platforms", error);
                setAvailabilityMessage("Error fetching platforms");
            }
        }

        if (movie && mediaDetails) {
            fetchPlatforms();
        }
    }, [selectedLocation, movie, mediaDetails]);

    useEffect(() => {
        async function fetchDetails() {
            try {
                const response = await fetch(`/api/movies/rating/${id}`);
                const data = await response.json();
                setSelectedWatchTypeKeys(new Set([data.follow.followType]));
                setIsSelected(data.follow.followType === "Watched");
                if (data.follow.followType === "Plan To Watch") {
                    setSelectedRating(new Set(['Rate The show']));
                } else {
                    setSelectedRating(new Set([data.rating.ratings.toString()]));
                }
                setAvgRating(data.overallRating);
                setFollowedUsers(data.followCount);
                setRatingCount(data.ratingCount);
                setRatingPosition(data.ratingPosition)
            } catch (error) {
                console.log(error);
            }
        }
        fetchDetails();
    }, [id]);

    useEffect(() => {
        async function fetchComments() {
            try {
                const response = await fetch(`/api/movies/comments/${id}`);
                const data = await response.json();
                setComment(data)
                const sortedComments = (data.comments || []).sort((a: Comments, b: Comments) => {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                });
                setComments(sortedComments);
                setCommentCount(data.commentCount);
            } catch (error) {
                console.log(error);
            }
        }
        fetchComments();
    }, [id]);


    useEffect(() => {
        const fetchAllUserDetails = async () => {
            try {
                const detailsMap: Record<string, any> = {};
                for (const comment of comments) {
                    const user = await fetchUserDetails(comment.username);
                    detailsMap[comment.username] = user;
                }
                setUserDetailsMap(detailsMap);
            } catch (error) {
                console.log(error);
            }
        };
        fetchAllUserDetails()
    }, [comments]);

    const handleCommentSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const commentText = formData.get('comment') as string;
        const response = await fetch(`/api/movies/comments/${id}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                comment: formData.get('comment'),
            })
        });

        if (response.ok) {
            const newComment: Comments = await response.json();
            setCommentValue('');

            setComments(prevComments => [{
                ...newComment,
                content: commentText,
                username: session?.user?.name as string,
                animation: true
            }, ...prevComments]);


            fetchUpdatedCommentData();
        } else {
            console.log(error);
        }
    };
    
    
    useEffect(() => {
        const fetchPrequel = async () => {
            try {
                const response = await fetch(`/api/movies/${movie?.prequel}`, {
                    method: "GET",
                });

                if (!response.ok) {
                    console.log("failed to fetch")
                }

                const data = await response.json();
                setPrequelMovie(data)
            } catch (error) {
                console.log(error);
            }
        };

        const fetchSequel = async () => {
            try {
                const response = await fetch(`/api/movies/${movie?.sequel}`, {
                    method: "GET",
                });

                if (!response.ok) {
                    console.log("failed to fetch")
                }

                const data = await response.json();
                setSequelMovie(data)
            } catch (error) {
                console.log(error);
            }
        };

        fetchPrequel(); 
        fetchSequel();
    }, [id,movie]); 

    const fetchUserDetails = async (username: string) => {
        try {
            console.log('Fetching user details for username:', username);
            const response = await fetch(`/api/profile/${username}`);
            if (!response.ok) throw new Error('User not found');
            const user = await response.json();
            return user;
        } catch (err: any) {
            throw new Error(err.message);
        }
    };

    const formatRating = (ratingCount: number) => {
        if (!ratingCount) {
            return 'Rating not available'
        }
        if(ratingCount >= 1 && ratingCount <= 3){
            return '(1+'
        }
        else if(ratingCount > 3 && ratingCount <= 5){
            return '(3+'
        }
        else if(ratingCount > 5 && ratingCount <= 10){
            return '(5+'
        }
        else if(ratingCount > 10 && ratingCount <= 25){
            return '(10+'
        }
        else if(ratingCount > 25 && ratingCount <= 50){
            return '(25+'
        }
        else if(ratingCount > 50 && ratingCount <= 100){
            return '(50+'
        }
        else if(ratingCount > 100 && ratingCount <= 250){
            return '(100+'
        }
        else if(ratingCount > 250 && ratingCount <= 500){
            return '(250+'
        }
        else if(ratingCount > 500 && ratingCount <= 1000){
            return '(500+'
        }
        else if(ratingCount > 1000){
            return '(1000+'
        }
        else
            return '(0'
    }
    
    const releaseDateCheck = (dateString: string) => {
        const today = new Date()
        const releaseDate = new Date(dateString)
        return releaseDate > today
    }
        
    const formatDate = (dateString: string) => {
        if (!dateString) {
            return 'Date not available';
        }

        const date = new Date(dateString);
        const day = date.getDate();
        const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
        const year = date.getFullYear();

        const daySuffix = (day: number) => {
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

    const timeAgo = (dateString: any) => {
        const date: Date = new Date(dateString);
        const now: Date = new Date();
        const seconds: number = Math.floor((now.getTime() - date.getTime()) / 1000);
        let interval: number;

        interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return interval + " year" + (interval > 1 ? "s" : "") + " ago";

        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return interval + " month" + (interval > 1 ? "s" : "") + " ago";

        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return interval + " day" + (interval > 1 ? "s" : "") + " ago";

        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval + " hour" + (interval > 1 ? "s" : "") + " ago";

        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval + " minute" + (interval > 1 ? "s" : "") + " ago";

        return "just now";
    };

    const bannerURL = `/images/movie_banners/${bannerImage}`;
    const profileImg = session?.user?.userpic;
    const profileImgURL = profileImg ? `/images/profilepictures/${profileImg}` : '';

    if (isLoading) {
        return (
            <div className="flex w-full h-screen text-white justify-center items-center">
                <CircularProgress/>
            </div>
        );
    }
    
    return (
        <div className="details-wrapper">
            {error ? (
                <div className={"flex w-full h-screen justify-center"}>
                    <h1 className={"text-white text-3xl mt-20"}>Movie not found</h1>
                </div>
            ): (
                <div className="details-container">
                    <div className="details-upper">
                        <div className="details-left-up">
                            <img src={bannerURL} alt="Movie Banner"/>
                        </div>
                        <div className="details-right-up">
                            <div className="details-right-container">
                                <div className="details-right-first-container">
                                    <div className="details-name-desc">
                                        <h1 className="text-white text-5xl font-bold mb-4">{movie?.movieName}</h1>
                                        <p className="text-white text-base opacity-70">{movie?.movieDesc}</p>
                                    </div>
                                    {movie?.trailerUrl ? (
                                        <div className="details-trailer">
                                            <YouTubeEmbed videoUrl={movie.trailerUrl}/>
                                        </div>
                                    ) : (
                                        <div className="platform-container-upper">
                                            <h2 className="text-white text-xl font-bold mb-2">Available On</h2>
                                            <div className="text-white mb-2">
                                                <label htmlFor="location">Select Location:</label>
                                                <select
                                                    className={"ml-2 w-28 text-black"}
                                                    id="location"
                                                    value={selectedLocation}
                                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                                >
                                                    {locations.map(location => (
                                                        <option key={location.code} value={location.code}>
                                                            {location.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {availabilityMessage ? (
                                                <p className="text-white">{availabilityMessage}</p>
                                            ) : (
                                                <div className="scrollable-platforms text-white"
                                                     style={{maxHeight: '100px', overflowY: 'scroll'}}>
                                                    <ul>
                                                        {platforms.map(platform => (
                                                            <li key={platform.provider_id}
                                                                className="flex items-center mb-2">
                                                                <img
                                                                    src={`https://image.tmdb.org/t/p/original${platform.logo_path}`}
                                                                    alt={platform.provider_name}
                                                                    className="w-10 h-10 mr-2"
                                                                />
                                                                <span>{platform.provider_name}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="details-right-second-container">
                                    <div className="flex w-full">
                                        <div className="w-full">
                                            <div className="h-2/3 flex flex-col text-white">
                                                {movie?.director && (
                                                    <div className="flex">
                                                        <span className="font-bold w-40">Director:</span>
                                                        <span>{movie.director}</span>
                                                    </div>
                                                )}
                                                <div className="flex">
                                                    <span className="font-bold w-40">Release date:</span>
                                                    <span>{formatDate(movie?.releaseDate as string)}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="font-bold w-40">Genre:</span>
                                                    <span>{movie?.genre}</span>
                                                </div>
                                            </div>
                                            <div className="details-rsc-upper">
                                                {session ? (
                                                    <form className={"flex"} onSubmit={handleSubmit}>
                                                        <div className="text-white">
                                                            <Dropdown>
                                                                <DropdownTrigger>
                                                                    <Button variant="bordered"
                                                                            className="capitalize details-add w-48">
                                                                        {selectedWatchTypeValue}
                                                                    </Button>
                                                                </DropdownTrigger>
                                                                <DropdownMenu
                                                                    className="details-add-items"
                                                                    aria-label="Single selection example"
                                                                    variant="flat"
                                                                    disallowEmptySelection
                                                                    selectionMode="single"
                                                                    selectedKeys={selectedWatchTypeKeys}
                                                                    // @ts-ignore
                                                                    onSelectionChange={setSelectedWatchTypeKeys}
                                                                    onAction={handleSelected}
                                                                >
                                                                    <DropdownItem className="details-add-item"
                                                                                  key="Watched"
                                                                                  isDisabled={releaseDateCheck(movie?.releaseDate || '')}
                                                                    >Watched</DropdownItem>
                                                                    <DropdownItem className="details-add-item"
                                                                                  key="Plan To Watch">Plan To
                                                                        Watch</DropdownItem>
                                                                </DropdownMenu>
                                                            </Dropdown>
                                                        </div>
                                                        {isSelected && selectedWatchTypeKeys.has("Watched") ? (
                                                            <div className="text-white ml-4">
                                                                <Dropdown>
                                                                    <DropdownTrigger>
                                                                        <Button variant="bordered"
                                                                                className="capitalize details-add w-48">
                                                                            {selectedRatingValue}
                                                                        </Button>
                                                                    </DropdownTrigger>
                                                                    <DropdownMenu
                                                                        className={"details-add-items"}
                                                                        aria-label="Single selection example"
                                                                        variant="flat"
                                                                        disallowEmptySelection
                                                                        selectionMode="single"
                                                                        selectedKeys={selectedRating}
                                                                        // @ts-ignore
                                                                        onSelectionChange={setSelectedRating}
                                                                    >
                                                                        <DropdownItem className="details-add-item"
                                                                                      key="5">(5)
                                                                            Masterpiece</DropdownItem>
                                                                        <DropdownItem className="details-add-item"
                                                                                      key="4">(4)
                                                                            Great</DropdownItem>
                                                                        <DropdownItem className="details-add-item"
                                                                                      key="3">(3)
                                                                            Good</DropdownItem>
                                                                        <DropdownItem className="details-add-item"
                                                                                      key="2">(2)
                                                                            Bad</DropdownItem>
                                                                        <DropdownItem className="details-add-item"
                                                                                      key="1">(1)
                                                                            Horrible</DropdownItem>
                                                                    </DropdownMenu>
                                                                </Dropdown>
                                                            </div>
                                                        ) : (
                                                            <div className="text-white ml-4">
                                                                <Button variant="bordered"
                                                                        disabled
                                                                        className="capitalize details-add w-48 opacity-70">
                                                                    {selectedRatingValue}
                                                                </Button>
                                                            </div>
                                                        )}
                                                        <button
                                                            type={"submit"}
                                                            className="details-confirmb">
                                                         <span className={`button-icon ${buttonStatus}`}>
                                                             {buttonStatus === 'success' &&
                                                                 <span
                                                                     className="material-symbols-outlined">check</span>}
                                                             {buttonStatus === 'initial' &&
                                                                 <span className="material-symbols-outlined">add</span>}
                                                         </span>
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <div className="ml-2 text-white">Please <span><Link
                                                        className={"text-blue-700 underline"}
                                                        href="/private/authentication/login">Login</Link></span> to
                                                        access these features</div>
                                                )}
                                            </div>
                                        </div>
                                        {movie?.trailerUrl && (
                                            <div className="platform-container">
                                                <h2 className="text-white text-xl font-bold mb-2">Available On</h2>
                                                <div className="text-white mb-2">
                                                    <label htmlFor="location">Select Location:</label>
                                                    <select
                                                        className={"ml-2 w-28 text-black"}
                                                        id="location"
                                                        value={selectedLocation}
                                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                                    >
                                                        {locations.map(location => (
                                                            <option key={location.code} value={location.code}>
                                                                {location.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {availabilityMessage ? (
                                                    <p className="text-white">{availabilityMessage}</p>
                                                ) : (
                                                    <div className="scrollable-platforms text-white"
                                                         style={{maxHeight: '100px', overflowY: 'scroll'}}>
                                                        <ul>
                                                            {platforms.map(platform => (
                                                                <li key={platform.provider_id}
                                                                    className="flex items-center mb-2">
                                                                    <img
                                                                        src={`https://image.tmdb.org/t/p/original${platform.logo_path}`}
                                                                        alt={platform.provider_name}
                                                                        className="w-10 h-10 mr-2"/>
                                                                    <span>{platform.provider_name}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="details-right-third-container">
                                    <div className="h-2/3 w-full flex justify-between mx-12 text-white items-center">
                                        <h1 className={`dt-txt ${animateUsers ? 'animate' : ''}`}>{followedUsers}<span
                                            className="material-symbols-outlined">group</span></h1>
                                        <div className={`dt-txt flex ${animateRating ? 'animate' : ''}`}>
                                            <h1>{avgRating}<span
                                                className="material-symbols-outlined">star</span></h1>
                                            <h1 className={"dt-txt-ct"}>{formatRating(ratingCount)}<span
                                                className="dt-txt-ic material-symbols-outlined">person)</span></h1>
                                        </div>
                                        <h1 className="dt-txt">#{ratingPosition}</h1>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className={"flex justify-center items-center"}>
                        <Divider orientation="horizontal" className={"details-h-divider"}/>
                    </div>
                    {(prequelMovie || sequelMovie) && (
                    <div className={"prequel-sequel-container"}>
                        {prequelMovie && (
                        <Link href={`/details/${prequelMovie?.movieId}`}>
                        <div className={"prequel-container"}>
                            <div className={"flex justify-center items-center"}>
                            <img src={`/images/movie_banners/${prequelMovie?.movieBanner}`}/>
                            <h1 className={"text-2xl ml-4 w-52 max-h-24"}>{prequelMovie?.movieName}</h1>
                            </div>
                            <div className={"previous-container-button"}>
                                <span className="material-symbols-outlined">arrow_back</span>
                                <h1 className={"text-right"}>Previous Movie</h1>
                            </div>
                        </div>
                        </Link>
                        )}
                        {sequelMovie && (
                        <Link href={`/details/${sequelMovie?.movieId}`}>
                        <div className={"sequel-container"}>
                            <div className={"sequel-container-button"}>
                                <span className="material-symbols-outlined">arrow_forward</span>
                                <h1 className={"text-left"}>Sequel Movie</h1>
                            </div>
                            <div className={"flex justify-center items-center"}>
                                <h1 className={"text-2xl ml-4 w-52 max-h-24"}>{sequelMovie?.movieName}</h1>
                                <img src={`/images/movie_banners/${sequelMovie?.movieBanner}`}/>
                            </div>
                        </div>
                        </Link>
                        )}
                    </div>
                    )}
                    <div className={"flex justify-center items-center"}>
                        <Divider orientation="horizontal" className={"details-h-divider"}/>
                    </div>
                    <div className="details-lower">
                        <div className={"comment-container"}>
                            <div className={"flex"}>
                                <h1 className={`ml-12 text-white font-bold text-3xl ${animateComment ? 'animate' : ''}`}>{commentCount}</h1>
                                <h1 className={`ml-2 text-white font-bold text-3xl`}>Comments</h1>
                            </div>
                            <div className={"session-comment-section"}>
                                <div className={"session-comment"}>
                                    {session ? (
                                        <form className={"flex w-full h-full justify-center items-center"}
                                              onSubmit={handleCommentSubmit}>
                                            <div className={"session-cprof"}><img src={profileImgURL}/></div>
                                            <textarea className={"comment-box"}
                                                      placeholder={"Share Your Opinions!!"}
                                                      name={"comment"}
                                                      id={"comment"}
                                                      value={commentValue}
                                                      onChange={(e) => setCommentValue(e.target.value)}
                                            >
                                    </textarea>
                                            <div className={"comment-send"}>
                                                <button type={"submit"}
                                                        className="capitalize details-add w-36 h-12 text-white text-center ml-12">Send
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="ml-2 text-white flex justify-center items-center h-full">
                                            <h1>Please <span><Link
                                                className={"text-blue-700 underline"}
                                                href="/private/authentication/login">Login</Link></span> to access these
                                                features
                                            </h1>
                                        </div>
                                    )}

                                </div>
                            </div>
                            <div className={"flex justify-center items-center"}>
                                <Divider orientation="horizontal" className={"details-h-divider"}/>
                            </div>
                            <div className={"user-comments-section"}>
                                <div className={"user-comments"}>
                                    {comments.map(comment => {
                                        const userDetails = userDetailsMap[comment.username];
                                        const commentImg = userDetails?.userpic;
                                        const commentImgURL = `/images/profilepictures/${commentImg}`;
                                        const profileURL = `/private/userprofile/${userDetails?.username}`;
                                        return (
                                            <div
                                                key={comment.commentId}
                                                className={`user-comment-container ${comment.animation ? 'comment-animate' : ''} ${deletingCommentId === comment.commentId ? 'animate-delete' : ''}`}
                                                onAnimationEnd={() => {
                                                    if (deletingCommentId === comment.commentId) {
                                                        setDeletingCommentId(null);
                                                    }
                                                    setComments(prevComments => prevComments.map(c =>
                                                        c.commentId === comment.commentId ? {...c, animation: false} : c
                                                    ));
                                                }}
                                            >
                                                <div className={"user-comment"}>
                                                    <div className={"session-cprof"}><Link href={profileURL}><img
                                                        src={commentImgURL}/></Link></div>
                                                    <div className={"user-comment-content"}>
                                                        <h1>{comment.content}</h1>
                                                        {session?.user?.isAdmin ? (
                                                            <button
                                                                onClick={() => handleDeleteComment(comment.commentId)}
                                                                className={"remove-comment"}><span
                                                                className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        ) : userDetails?.username === session?.user?.name && (
                                                            <button
                                                                onClick={() => handleDeleteComment(comment.commentId)}
                                                                className={"remove-comment"}><span
                                                                className="material-symbols-outlined">delete</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={"comment-created-at"}>
                                                    <h1>{userDetails?.username}</h1>
                                                    <p className={"opacity-70"}>{timeAgo(comment.created_at)}</p>
                                                </div>
                                                <div className={"flex justify-center items-center mt-8"}>
                                                    <Divider orientation="horizontal" className={"details-h-divider"}/>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className={"flex justify mt-12"}>
                            <Divider orientation="vertical" className={"details-v-divider"}/>
                        </div>
                        <div className={"actor-container"}>
                            <h1 className={"text-white text-2xl font-bold mr-4"}>Actors</h1>
                            {actors.map(actor => (
                                <div key={actor.id} className="actor-item">
                                    <img src={`https://image.tmdb.org/t/p/original${actor.profile_path}`}
                                         alt={actor.name}/>
                                    <span className="text-white text-sm">{actor.name} <br/></span>
                                    <span className="text-white">{actor.character}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}