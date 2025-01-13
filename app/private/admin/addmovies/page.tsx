'use client';
import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";

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
}

export default function Admin() {
    const [selectedTypeKeys, setSelectedTypeKeys] = useState(new Set<string>(['Movie']));
    const [selectedGenreKeys, setSelectedGenreKeys] = useState(new Set<string>());
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState("");
    const router = useRouter();

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

        if (!movieName || !movieDesc || !genre || !releaseDate || !selectedFile) {
            setErrorMessage('All fields except Director and Trailer URL are required.');
            return;
        }

        if (selectedFile) {
            formData.append("myImage", selectedFile);
        }
        formData.append("type", movieType);
        formData.append("genre", genre);

        const response = await fetch('/api/movies', {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            router.push('/private/admin');
        } else {
            const serverMessage = await response.json();
            setErrorMessage(serverMessage.message);
        }
    };

    return (
        <div className="admin-wrapper">
            <div className={"admin-container"}>
                <div className={"admin-box"}>
                    <div className={"upper-admin-box"}>
                        <div className={"upper-box"}>
                            <h2 className={"ml-8"}>Add Movie/Tv Show</h2>
                            <Link href={"/private/admin"} className={"h-full"}>
                                <button className={"admin-add-button"}>
                                    <span className="material-symbols-outlined text-white">close</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className={"admin-box-mid"}>
                        <form onSubmit={handleSubmit}>
                            <div className={"flex justify-between items-center"}>
                                <div className={"add-movie-left"}>
                                    <div className={"add-movie-banner"}>
                                        {selectedImage ? (
                                            <img src={selectedImage} alt="Banner" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="dashed-area">Banner will be displayed here</div>
                                        )}
                                    </div>
                                </div>
                                <div className={"add-movie-right"}>
                                    <div className={"add-movie-container"}>
                                        <label className={"block text-white font-bold"}>Movie/Tv Show name:</label>
                                        <input
                                            name="movie-name"
                                            className={"w-72 text-black rounded mb-8"}
                                        />
                                        <label className={"block text-white font-bold"}>Movie/Tv Show Summary:</label>
                                        <textarea
                                            name="movie-desc"
                                            className={"h-24 text-black resize-none rounded mb-4"}
                                        />
                                        <div className={"flex justify-between items-center mb-4"}>
                                            <div>
                                                <label className={"block text-white font-bold"} htmlFor={"release-date"}>Release Date:</label>
                                                <input
                                                    type={"date"}
                                                    name={"release-date"}
                                                    className={"mt-2 rounded-lg p-1 custom-datepicker text-black"}
                                                    id={"release-date"}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className={"block text-white font-bold"}>Director:</label>
                                                <input
                                                    name="director"
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
                                                        className={"dd-add-admin-items"}
                                                        aria-label="Single selection example"
                                                        variant="flat"
                                                        disallowEmptySelection
                                                        selectionMode="single"
                                                        selectedKeys={selectedTypeKeys}
                                                        // @ts-ignore
                                                        onSelectionChange={setSelectedTypeKeys}
                                                    >
                                                        <DropdownItem className={"dd-add-admin-item"} key="Movie">Movie</DropdownItem>
                                                        <DropdownItem className={"dd-add-admin-item"} key="Tv Show">Tv Show</DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </div>
                                        </div>
                                        <div className={"flex justify-between mb-8"}>
                                            <div>
                                                <label className={"block text-white font-bold"}>Trailer URL:</label>
                                                <input
                                                    name="trailer-url"
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
                                                    className={"dd-add-admin-items"}
                                                    aria-label="Single selection example"
                                                    variant="flat"
                                                    disallowEmptySelection
                                                    selectionMode="multiple"
                                                    selectedKeys={selectedGenreKeys}
                                                    // @ts-ignore
                                                    onSelectionChange={setSelectedGenreKeys}
                                                >
                                                    <DropdownItem className={"dd-add-admin-item"} key="Action">Action</DropdownItem>
                                                    <DropdownItem className={"dd-add-admin-item"} key="Adventure">Adventure</DropdownItem>
                                                    <DropdownItem className={"dd-add-admin-item"} key="Animation">Animation</DropdownItem>
                                                    <DropdownItem className={"dd-add-admin-item"} key="Comedy">Comedy</DropdownItem>
                                                    <DropdownItem className={"dd-add-admin-item"} key="Crime">Crime</DropdownItem>
                                                    <DropdownItem className={"dd-add-admin-item"} key="Documentary">Documentary</DropdownItem>
                                                    <DropdownItem className={"dd-add-admin-item"} key="Drama">Drama</DropdownItem>
                                                    <DropdownItem className={"dd-add-admin-item"} key="Fantasy">Fantasy</DropdownItem>
                                                    <DropdownItem className={"dd-add-admin-item"} key="Horror">Horror</DropdownItem>
                                                    <DropdownItem className={"dd-add-admin-item"} key="Romance">Romance</DropdownItem>
                                                    <DropdownItem className={"dd-add-admin-item"} key="Science-fiction">Science-fiction</DropdownItem>
                                                    <DropdownItem className={"dd-add-admin-item"} key="Sports">Sports</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                        <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded">Add Movie/Tv Show</button>
                                        {errorMessage && (
                                            <div className="mt-4 text-red-500">{errorMessage}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className={"lower-admin-box"}></div>
                </div>
            </div>
        </div>
    );
}
