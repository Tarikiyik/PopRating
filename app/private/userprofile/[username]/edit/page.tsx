'use client'
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import React, {FormEvent, useEffect, useRef, useState} from "react";
import {Divider} from "@nextui-org/divider";
import {Switch} from "@nextui-org/switch";
import CircularProgress from "@/components/circularProgress";
import {useRouter} from "next/navigation";
import { signOut } from 'next-auth/react';

export default function Edit() {
    const { data: session, status, update } = useSession();
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [profileImg, setProfileImg] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeTab,setActiveTab] = useState('a')
    const [birthdayValue,setBirthdayValue] = useState('')
    const [buttonAnimation,setButtonAnimation] = useState(false)
    const [theme,setTheme] = useState('')
    const [isFavSecure,setIsFavSecure] = useState(false)
    const [isPrfSecure,setIsPrfSecure] = useState(false)
    const [isLoading, setIsLoading] = useState(true);
    const [displayDelete,setDisplayDelete] = useState(false)
    
    const router = useRouter()

    const handleDeleteConfirm = () => {
        setDisplayDelete((prev) => !prev);
    };

    useEffect(() => {
        if (session && session.user) {
            setProfileImg(session.user.userpic);
            if(session.user.birthday){
                // @ts-ignore
                setBirthdayValue(formatDateInput(session.user.birthday))
            }
            setIsFavSecure(session.user.favsecure)
            setIsPrfSecure(session.user.prfsecure)
        }
        setIsLoading(false)
    }, [session]);
    
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const response = await fetch('/api/profile/editprofile', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: formData.get('username-prf'),
                userid: session?.user?.userid,
                birthday: formData.get('birthday-prf'),
                oldpassword: formData.get('password-old-prf'),
                newpassword: formData.get('password-new-prf'),
                newpasswordc: formData.get('password-newc-prf'),
                userbg: formData.get('theme'),
                userdesc: formData.get('desc-prf'),
            })
        });

        if (response.ok) {
            const updatedUser = await response.json();
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: updatedUser.user.username,
                    birthday: updatedUser.user.birthday,
                    userbg: updatedUser.user.userbg,
                    userdesc: updatedUser.user.userdesc
                }
            });
            console.log("Session updated successfully");
            window.location.reload(); 
        }
        else{
            const serverMessage = await response.json()
            setErrorMessage(serverMessage.message)
            triggerButtonAnimation()
        }
    };

    const triggerButtonAnimation= () =>{
        setButtonAnimation(true)
        setTimeout(() => {
            setButtonAnimation(false)
        },2000)
    }
    
    const handleThemeChange = (theme : string)  => {
        setTheme(theme)
    }

    const handleFavSecureChange = async (value: boolean) => {
        setIsFavSecure(value);
        try {
            const response = await fetch('/api/profile/editprofile', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userid: session?.user?.userid,
                    favsecure: value,
                })
            });

            if (!response.ok) {
                const serverMessage = await response.json();
                setErrorMessage(serverMessage.message);
            } else {
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        favsecure: value
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handlePrfSecureChange = async (value: boolean) => {
        setIsPrfSecure(value);
        try {
            const response = await fetch('/api/profile/editprofile', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userid: session?.user?.userid,
                    prfsecure: value,
                })
            });

            if (!response.ok) {
                const serverMessage = await response.json();
                setErrorMessage(serverMessage.message);
            } else {
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        prfsecure: value
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleUpload = async (file: File) => {
        if (!file) {
            console.log("No file selected");
            return;
        }

        if (!file.type.startsWith('image/')) {
            setErrorMessage("Only images are allowed");
            setUploading(false);
            return;
        }

        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
            setErrorMessage("File size must be less than 5MB");
            setUploading(false);
            return;
        }

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
                setErrorMessage(`Image dimensions must be within ${MAX_WIDTH}x${MAX_HEIGHT} pixels`);
                setUploading(false);
                return;
            }

            setUploading(true);
            try {
                const formData = new FormData();
                formData.append("myImage", file);
                const response = await fetch('/api/images', {
                    method: "POST",
                    body: formData,
                });
                const data = await response.json();
                console.log(data);
                if (response.ok) {
                    await update({
                        ...session,
                        user: {
                            ...session?.user,
                            userpic: data.name
                        }
                    });
                    console.log("Session updated successfully");
                    setProfileImg(data.name);
                } else {
                    setErrorMessage("Failed to upload image");
                }
            } catch (error: any) {
                console.log(error.response?.data);
            } finally {
                setUploading(false);
            }
        };
    };
    
    const handleTabClick = (tab: string) => {
        setActiveTab(tab)
    }

    const handleConfirmDeletion = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const password = formData.get('password');

        if (!password) {
            setErrorMessage("Password is required to confirm account deletion.");
            return;
        }

        try {
            const response = await fetch(`/api/profile/${session?.user?.name}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            if (response.ok) {
                await signOut({ redirect: false }); 
                router.push('/private/authentication/login');       
            } else {
                const serverMessage = await response.json();
                setErrorMessage(serverMessage.message);
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            setErrorMessage("An error occurred. Please try again.");
        }
    };
    


    const formatDate = (dateString:any) => {
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



    const formatDateInput = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    };

        const profileImgURL = `/images/profilepictures/${profileImg}`;
        const date = session?.user?.createdAt
        const birthday = session?.user?.birthday


    return (
        <div className={"edit-wrapper text-white"}>
            <div className={"edit-profile"}>
                <div className={"edit-container"}>
                    <div className={"edit-left"}>
                        <button className={`${activeTab === 'a' ? 'active-tab' : 'tab-button'}`} onClick={() => handleTabClick('a')}>Edit Profile</button>
                        <button className={`${activeTab === 'b' ? 'active-tab' : 'tab-button'}`} onClick={() => handleTabClick('b')}>Change Theme</button>
                        <button className={`${activeTab === 'c' ? 'active-tab' : 'tab-button'}`} onClick={() => handleTabClick('c')}>Settings</button>
                        <button className={`delete ${activeTab === 'd' ? 'delete-tab' : ''}`} onClick={() => handleTabClick('d')}>Delete Account</button>
                    </div>
                    <Divider orientation="vertical" className={"edit-divider"} />
                    <div className={"edit-right"}>
                        {isLoading ? (
                            <div className="flex w-full h-screen text-black justify-center items-center">
                            <CircularProgress/>
                            </div>
                        ):(
                            
                        
                        <div className={"edit-right-content"}>
                            {activeTab === 'a' && (
                                <div className={"text-black"}>
                                    <div className={"flex justify-between profile-image relative"}>
                                        <div>
                                            <h1 className={"text-2xl"}>Email: {session?.user?.email}</h1>
                                            <h1 className={"text-xl"}>Created At: {formatDate(date)} </h1>
                                        </div>
                                        <div className="relative">
                                            <img src={profileImgURL} className="relative w-full h-full object-cover"/>
                                            <input
                                                type="file"
                                                hidden
                                                id="profile-image-upload"
                                                onChange={({target}) => {
                                                    if (target.files) {
                                                        const file = target.files[0];
                                                        setSelectedImage(URL.createObjectURL(file));
                                                        setSelectedFile(file);
                                                        handleUpload(file); 
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor="profile-image-upload"
                                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <span
                                                    className="material-symbols-outlined text-white">add_a_photo</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className={"edit-form mt-4"}>
                                        <form onSubmit={handleSubmit}>
                                            <div className={"flex justify-between mb-1"}>
                                                <div className={"flex flex-col w-1/2"}>
                                                    <label className={"mt-5"}>Username:</label>
                                                    <input
                                                        className={"rounded  h-8"}
                                                        type={'text'}
                                                        placeholder={session?.user?.name as string}
                                                        name="username-prf"
                                                        id="username-prf"
                                                    />
                                                    <label className={"mt-5"}>Description:</label>
                                                    <input
                                                        className={"rounded  h-8"}
                                                        type={'text'}
                                                        placeholder={session?.user?.userdesc as string}
                                                        name="desc-prf"
                                                        id="desc-prf"
                                                    />
                                                    <label className={"mt-3"}>Birthday:</label>
                                                    <input
                                                        className={"rounded w-1/2 h-8"}
                                                        type={"date"}
                                                        name="birthday-prf"
                                                        id="birthday-prf"
                                                        value={birthdayValue}
                                                        onChange={(e) => (setBirthdayValue(e.target.value))}
                                                    />
                                                </div>
                                                <div className={"flex flex-col w-1/2 ml-64"}>
                                                    <label className={"mt-4"}>Old Password:</label>
                                                    <input
                                                        className={"rounded h-8"}
                                                        type={'password'}
                                                        name="password-old-prf"
                                                        id="password-old-prf"
                                                    />
                                                    <label className={"mt-3"}>New Password:</label>
                                                    <input
                                                        className={"rounded h-8"}
                                                        type={'password'}
                                                        name="password-new-prf"
                                                        id="password-new-prf"
                                                    />
                                                    <label className={"mt-3"}>New Password Confirmation:</label>
                                                    <input
                                                        className={"rounded h-8"}
                                                        type={'password'}
                                                        name="password-newc-prf"
                                                        id="password-newc-prf"
                                                    />
                                                </div>
                                            </div>
                                            <div className={"edit-submit flex  justify-end"}>
                                                <div className={"text-right w-72"}>
                                                <button className={buttonAnimation ? 'shake-animation' : ''}
                                                        type="submit" disabled={uploading}>
                                                    {uploading ? "Updating..." : "Update Settings"}
                                                </button>
                                                {errorMessage && <p className="edit-error">{errorMessage}</p>}
                                            </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'b' && (
                                <div className={"selectTheme"}>
                                    <form onSubmit={handleSubmit}>
                                        <div className={"upper-theme-container"}>
                                            <input type="hidden" name="theme" value={theme}/>
                                            <button
                                                type="button"
                                                className={`grid-item bg1 ${session?.user?.userbg === 'bg1' ? 'active-bg': `${theme === 'bg1' ? 'selected-bg' : ''}`}`}
                                                value="bg1"
                                                onClick={() => handleThemeChange('bg1')}
                                            ></button>
                                            <button
                                                type="button"
                                                className={`grid-item bg2 ${session?.user?.userbg === 'bg2' ? 'active-bg': `${theme === 'bg2' ? 'selected-bg' : ''}`}`}
                                                value="bg2"
                                                onClick={() => handleThemeChange('bg2')}
                                            ></button>
                                            <button
                                                type="button"
                                                className={`grid-item bg3 ${session?.user?.userbg === 'bg3' ? 'active-bg': `${theme === 'bg3' ? 'selected-bg' : ''}`}`}
                                                value="bg3"
                                                onClick={() => handleThemeChange('bg3')}
                                            ></button>
                                            <button
                                                type="button"
                                                className={`grid-item bg4 ${session?.user?.userbg === 'bg4' ? 'active-bg': `${theme === 'bg4' ? 'selected-bg' : ''}`}`}
                                                value="bg4"
                                                onClick={() => handleThemeChange('bg4')}
                                            ></button>
                                            <button
                                                type="button"
                                                className={`grid-item bg5 ${session?.user?.userbg === 'bg5' ? 'active-bg': `${theme === 'bg5' ? 'selected-bg' : ''}`}`}
                                                value="bg5"
                                                onClick={() => handleThemeChange('bg5')}
                                            ></button>
                                            <button
                                                type="button"
                                                className={`grid-item bg6 ${session?.user?.userbg === 'bg6' ? 'active-bg': `${theme === 'bg6' ? 'selected-bg' : ''}`}`}
                                                value="bg6"
                                                onClick={() => handleThemeChange('bg6')}
                                            ></button>
                                            <button
                                                type="button"
                                                className={`grid-item bg7 ${session?.user?.userbg === 'bg7' ? 'active-bg': `${theme === 'bg7' ? 'selected-bg' : ''}`}`}
                                                value="bg7"
                                                onClick={() => handleThemeChange('bg7')}
                                            ></button>
                                            <button className={"submit-bg"} type="submit">Submit Theme</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                            {activeTab === 'c' && (
                                <div className={"text-black"}>
                                    {!isPrfSecure ? (
                                    <div className={"fav-container"}>
                                        <div className={"favc-left"}>
                                            <h1 className={"text-2xl my-2"}>Hide Favorite Shows</h1>
                                            <p className={"opacity-70 text-sm w-11/12"}>This setting allows you to hide your list of favorite shows from being visible on your profile. When enabled, other users will not be able to see the shows you’ve marked as favorites, ensuring your viewing preferences remain private.</p>
                                        </div>
                                        <div className={"favc-right"}>
                                            <div className="flex flex-col gap-2">
                                                <Switch  className={"bg-blue-600 rounded-2xl w-12"}  isSelected={isFavSecure} onValueChange={handleFavSecureChange}>
                                                </Switch>
                                            </div>
                                        </div>
                                    </div>
                                    ): 
                                        (
                                        <div className={"fav-container opacity-50"}>
                                            <div className={"favc-left"}>
                                                <h1 className={"text-2xl my-2"}>Hide Favorite Shows</h1>
                                                <p className={"opacity-70 text-sm w-11/12"}>This setting allows you to
                                                    hide your list of favorite shows from being visible on your profile.
                                                    When enabled, other users will not be able to see the shows you’ve
                                                    marked as favorites, ensuring your viewing preferences remain
                                                    private.</p>
                                            </div>
                                            <div className={"favc-right"}>
                                                <div className="flex flex-col gap-2">
                                                    <Switch isDisabled={true} className={"bg-blue-600 rounded-2xl w-12"}
                                                            isSelected={false}>
                                                    </Switch>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className={"prfsecure-container"}>
                                        <div className={"favc-left"}>
                                            <h1 className={"text-2xl my-2"}>Hide Profile</h1>
                                            <p className={"opacity-70 text-sm w-11/12"}>Enable this option to make your
                                                entire profile invisible to other users. When your profile is hidden all
                                                profile details, including followed shows and favorite lists, will not
                                                be accessible by anyone else on the platform. This setting is ideal if
                                                you prefer to maintain complete privacy.</p>
                                        </div>
                                        <div className={"favc-right"}>
                                            <div className="flex flex-col gap-2">
                                                <Switch className={"bg-red-600 rounded-2xl w-12"}
                                                        isSelected={isPrfSecure} onValueChange={handlePrfSecureChange}>
                                                </Switch>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'd' && (
                                <div className={"text-black"}>
                                    <h1 className={"text-2xl"}>Delete Account</h1>
                                    <div className={"delete-account-dash"}>
                                    </div>
                                    <div>
                                        <h1 className={"text-xl mt-4"}>⚠️ Warning:</h1>
                                        <h2 className={"mt-4"}>Deleting your account is a permanent action. Once deleted, all your data will be lost, including:</h2>
                                        <ul className={""}>
                                            <li>	•	Profile information</li>
                                            <li>	•	Followed movies and TV shows</li>
                                            <li>	•	Favorite shows</li>
                                            <li>	•	Personal settings</li>
                                        </ul>
                                        <h2>This action cannot be undone.</h2>
                                    </div>
                                    <div className={"mt-20"}>
                                        <h1 className={"text-xl"}>Are You Sure You Want to Continue?</h1>
                                        <button onClick={handleDeleteConfirm} className={"delete-account-button"}>Delete Your Account</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        )}
                    </div>
                </div>
                {displayDelete && (
                    <div className={"delete-confirm"}>
                        <div className={"delete-confirm-container"}>
                            <div className="delete-content">
                                <h2 className="delete-title">Enter Your Password to Confirm Account Deletion</h2>
                                <p className="delete-description">To prevent unauthorized account deletion, please enter your password below to confirm that you wish to permanently delete your account.</p>
                                <form onSubmit={handleConfirmDeletion}>
                                    <input
                                        type="password"
                                        className="delete-password-input"
                                        name="password"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <div className="delete-buttons">
                                        <button type="submit" className="confirm-delete-button">Confirm Deletion</button>
                                        <button type="button" onClick={handleDeleteConfirm} className="cancel-button">Cancel</button>
                                    </div>
                                </form>
                                {errorMessage && <p className="delete-error">{errorMessage}</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

