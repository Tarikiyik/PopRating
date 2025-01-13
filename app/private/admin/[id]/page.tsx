'use client';
import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import searchMovieAdmin from "@/components/searchMovieAdmin";
import SearchMovieAdmin from "@/components/searchMovieAdmin";

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

export default function EditMovie() {
    const [movie, setMovie] = useState<Movie | null>(null);
    const [selectedTypeKeys, setSelectedTypeKeys] = useState(new Set<string>());
    const [selectedGenreKeys, setSelectedGenreKeys] = useState(new Set<string>());
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState("");
    const [releaseValue,setReleaseValue] = useState('')
    const [selectedBannerImage, setSelectedBannerImage] = useState("");
    const [isConnectionVisible,setIsConnectionVisible] = useState(false)
    const router = useRouter();
    const { id } = useParams();

    

    useEffect(() => {
        async function fetchMovie() {
            try {
                const response = await fetch(`/api/movies/${id}`);
                const data = await response.json();
                setMovie(data);
                setSelectedTypeKeys(new Set<string>([data.type ? 'Movie' : 'Tv Show']));
                setSelectedGenreKeys(new Set<string>(data.genre.split(', ')));
                setBannerImage(data.movieBanner);
                setReleaseValue(formatDateInput(data.releaseDate))
            } catch (error) {
                console.error("Error fetching movie", error);
            }
        }
        fetchMovie();
    }, [id]);
    
    const selectedTypeValue = React.useMemo(() => {
        if (selectedTypeKeys.size === 0) {
            return 'Movie';
        }
        return Array.from(selectedTypeKeys).join(', ').replaceAll('_', ' ');
    }, [selectedTypeKeys]);

    const selectedGenreValue = React.useMemo(() => {
        if (selectedGenreKeys.size === 0) {
            return 'Genre';
        }
        return Array.from(selectedGenreKeys).join(', ').replaceAll('_', ' ');
    }, [selectedGenreKeys]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const movieType = selectedTypeValue === 'Movie' ? 'true' : 'false';
        const movieName = formData.get('movie-name') as string;
        const movieDesc = formData.get('movie-desc') as string;
        const genre = Array.from(selectedGenreKeys).join(', ');
        const releaseDate = formData.get('release-date') as string;

        if (!movieName || !movieDesc || !genre || !releaseDate) {
            setErrorMessage('All fields except Director and Trailer URL are required.');
            return;
        }

        if (selectedFile) {
            formData.append("myImage", selectedFile);
        }
        formData.append("type", movieType);
        formData.append("genre", genre);

        const response = await fetch(`/api/movies/${id}`, {
            method: "PUT",
            body: formData
        });

        if (response.ok) {
            router.push('/private/admin');
        } else {
            const serverMessage = await response.json();
            setErrorMessage(serverMessage.message);
        }
    };

    const handleIsVisible = () => {
        if(isConnectionVisible) setIsConnectionVisible(false)
        else setIsConnectionVisible(true)
    }
    
    const handleSliderDelete = async () => {
        if(!movie) {
            return
        }
        const formData = new FormData();
        formData.append("movieId", movie.movieId);
        
        const response = await fetch('/api/slider/sliderremove', {
            method: "POST",
            body: formData,
            headers: {
                'Accept':'application/json'
            }
        });

        if (response.ok) {
            setSelectedBannerImage(' ');
            alert('Slider image deleted successfully!');
        } else {
            const serverMessage = await response.json();
            setErrorMessage(serverMessage.message);
        }
    };

    const handleSliderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            if (!file) {
                setErrorMessage('No file selected for slider upload.');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setErrorMessage("Only images are allowed");
                return;
            }

            const MAX_SIZE = 5 * 1024 * 1024; //5mb
            if (file.size > MAX_SIZE) {
                setErrorMessage("File size must be less than 5MB");
                return;
            }

            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = async () => {
                const MIN_WIDTH = 800;
                const MIN_HEIGHT = 800;
                if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
                    setErrorMessage(`Image dimensions minimum must be ${MIN_WIDTH}x${MIN_HEIGHT} pixels`);
                    return;
                }

                const formData = new FormData();
                formData.append("myImage", file);
                formData.append("movieId", movie?.movieId as string);

                const response = await fetch('/api/slider/sliderupload', {
                    method: "POST",
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    setSelectedBannerImage(data.url);
                    alert('Slider image uploaded successfully!');
                } else {
                    const serverMessage = await response.json();
                    setErrorMessage(serverMessage.message);
                }
            };
        }
    };
    
    const formatDateInput = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    };
    const bannerURL = `/images/movie_banners/${bannerImage}`;
    
    
    
    return (
        <div className="admin-wrapper">
            <div className={"admin-container"}>
                <div className={"admin-box"}>
                    <div className={"upper-admin-box"}>
                        <div className={"upper-box"}>
                            <h2 className={"ml-8"}>Edit Movie/Tv Show</h2>
                            <div>
                                <button onClick={handleIsVisible} className={"admin-add-button-l"}>
                                    <span className="material-symbols-outlined text-white">link</span>
                                </button>
                            <Link href={"/private/admin"} className={"h-full"}>
                                <button className={"admin-add-button-r"}>
                                    <span className="material-symbols-outlined text-white">close</span>
                                </button>
                            </Link>
                            </div>
                        </div>
                    </div>
                    <div className={"admin-box-mid"}>
                        {movie && (
                            <form onSubmit={handleSubmit}>
                                <div className={"flex justify-between items-center"}>
                                    <div className={"add-movie-left"}>
                                        <div className={"add-movie-banner"}>
                                            {selectedImage ? (
                                                <img src={selectedImage} alt="Banner" className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={bannerURL} alt="Banner"
                                                     className="w-full h-full object-cover"/>
                                            )}
                                        </div>
                                    </div>
                                    <div className={"add-movie-right"}>
                                        <div className={"add-movie-container"}>
                                            <label className={"block text-white font-bold"}>Movie/Tv Show name:</label>
                                            <input
                                                name="movie-name"
                                                defaultValue={movie.movieName}
                                                className={"w-72 text-black rounded mb-8 2xl:mb-12"}
                                            />
                                            <label className={"block text-white font-bold"}>Movie/Tv Show Summary:</label>
                                            <textarea
                                                name="movie-desc"
                                                defaultValue={movie.movieDesc}
                                                className={"h-24 text-black resize-none rounded mb-4 2xl:mb-8"}
                                            />
                                            <div className={"flex justify-between items-center mb-4 2xl:mb-6"}>
                                                <div>
                                                    <label className={"block text-white font-bold"} htmlFor={"release-date"}>Release Date:</label>
                                                    <input
                                                        type={"date"}
                                                        name={"release-date"}
                                                        value={releaseValue}
                                                        className={"mt-2 rounded-lg p-1 custom-datepicker text-black"}
                                                        id={"release-date"}
                                                        required
                                                        onChange={(e) => (setReleaseValue(e.target.value))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={"block text-white font-bold"}>Director:</label>
                                                    <input
                                                        name="director"
                                                        defaultValue={movie.director}
                                                        className={"w-32 text-black mt-2 h-8 rounded"}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={"block text-white font-bold"}>Type:</label>
                                                    <Dropdown>
                                                        <DropdownTrigger>
                                                            <Button
                                                                variant="bordered"
                                                                className="capitalize dd-add-admin mt-2"
                                                            >
                                                                {selectedTypeValue}
                                                            </Button>
                                                        </DropdownTrigger>
                                                        <DropdownMenu
                                                            className={"dd-add-items"}
                                                            aria-label="Single selection example"
                                                            variant="flat"
                                                            disallowEmptySelection
                                                            selectionMode="single"
                                                            selectedKeys={selectedTypeKeys}
                                                            // @ts-ignore
                                                            onSelectionChange={setSelectedTypeKeys}
                                                        >
                                                            <DropdownItem className={"dd-add-item"} key="Movie">Movie</DropdownItem>
                                                            <DropdownItem className={"dd-add-item"} key="Tv Show">Tv Show</DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                            <div className={"flex justify-between mb-8"}>
                                                <div>
                                                    <label className={"block text-white font-bold"}>Trailer URL:</label>
                                                    <input
                                                        name="trailer-url"
                                                        defaultValue={movie.trailerUrl}
                                                        className={"w-52 text-black mt-2 h-8 rounded"}
                                                    />
                                                </div>
                                                <div className={"mt-5"}>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        id="banner-upload"
                                                        className="hidden"
                                                        onChange={({ target }) => {
                                                            if (target.files) {
                                                                const file = target.files[0];
                                                                setSelectedImage(URL.createObjectURL(file));
                                                                setSelectedFile(file);
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor="banner-upload" className="add-photo-wrapper-banner add-photo-banner">
                                                        <span className="material-symbols-outlined">add_a_photo</span> Add Banner
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className={"block text-white font-bold mb-2"}>Genre:</label>
                                                <Dropdown>
                                                    <DropdownTrigger>
                                                        <Button variant="bordered" className="capitalize dd-add-admin">
                                                            {selectedGenreValue}
                                                        </Button>
                                                    </DropdownTrigger>
                                                    <DropdownMenu
                                                        className={"dd-add-items"}
                                                        aria-label="Single selection example"
                                                        variant="flat"
                                                        disallowEmptySelection
                                                        selectionMode="multiple"
                                                        selectedKeys={selectedGenreKeys}
                                                        // @ts-ignore
                                                        onSelectionChange={setSelectedGenreKeys}
                                                    >
                                                        <DropdownItem className={"dd-add-item"} key="Action">Action</DropdownItem>
                                                        <DropdownItem className={"dd-add-item"} key="Adventure">Adventure</DropdownItem>
                                                        <DropdownItem className={"dd-add-item"} key="Animation">Animation</DropdownItem>
                                                        <DropdownItem className={"dd-add-item"} key="Comedy">Comedy</DropdownItem>
                                                        <DropdownItem className={"dd-add-item"} key="Crime">Crime</DropdownItem>
                                                        <DropdownItem className={"dd-add-item"} key="Documentary">Documentary</DropdownItem>
                                                        <DropdownItem className={"dd-add-item"} key="Drama">Drama</DropdownItem>
                                                        <DropdownItem className={"dd-add-item"} key="Fantasy">Fantasy</DropdownItem>
                                                        <DropdownItem className={"dd-add-item"} key="Horror">Horror</DropdownItem>
                                                        <DropdownItem className={"dd-add-item"} key="Romance">Romance</DropdownItem>
                                                        <DropdownItem className={"dd-add-item"} key="Science-fiction">Science-fiction</DropdownItem>
                                                        <DropdownItem className={"dd-add-item"} key="Sports">Sports</DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </div>
                                            <div className={"w-full"}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    id="slider-banner-upload"
                                                    className="hidden"
                                                    onChange={handleSliderUpload}
                                                />
                                                <button type="button"
                                                        onClick={() => document.getElementById('slider-banner-upload')?.click()}
                                                        className="mt-4 p-2 bg-gray-400 rounded-l w-1/2 hover:brightness-110 2xl:mt-16">Upload
                                                    Slider Banner
                                                </button>
                                                <button type="submit"
                                                        className="mt-4 p-2 bg-blue-500 text-white rounded-r w-1/2 hover:brightness-110 2xl:mt-16">Update
                                                    Movie/Tv Show
                                                </button>
                                                {errorMessage && (
                                                    <div className="mt-4 text-red-500">{errorMessage}</div>
                                                )}
                                                {movie.movieCarousel && (
                                                <div className={"flex justify-center items-center"}>
                                                <button onClick={handleSliderDelete} className="mt-4 p-2 bg-red-700 text-white rounded w-full hover:brightness-110">Remove Slider Banner</button>
                                                </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                    <div className={"lower-admin-box"}></div>
                </div>
            </div>
            {isConnectionVisible && (
                <div className={"connect-wrapper"}>
                    <div className={"connect-container"}>
                            <SearchMovieAdmin />
                        
                        <button onClick={handleIsVisible} className={"connect-close"}>X</button>
                    </div>
                </div>
            )}
        </div>
    );
}
