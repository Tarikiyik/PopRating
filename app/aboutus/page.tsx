import React from 'react';
import '@/app/aboutus/about.css'; 

const AboutPage = () => {
    return (
        <div className="about">
            <div className="about-container">
                <h1>About Us</h1>
                <p>
                    PopRating has been your go-to platform for discovering and sharing movie experiences since 2024.
                </p>

                <div className="about-details">
                    <div className="about-block">
                        <h2>Our Mission</h2>
                        <p>
                            At PopRating, our mission is to elevate the way you engage with movies by providing a platform where film enthusiasts can discover, rate, and discuss the latest films and timeless classics. We are dedicated to fostering a community that celebrates the diversity of cinema, from blockbuster hits to indie treasures.
                        </p>
                        <p>
                            <br />We’re more than just a movie review site; we’re a hub for cinematic dialogue. Whether you’re looking to find your next favorite film or share your thoughts on the latest release, PopRating is here to connect you with a global community of movie lovers.

                        </p>
                    </div>

                    <div className="about-block">
                        <h2>Our Technology</h2>
                        <p>
                            Innovation drives everything we do. We continuously refine our technology to provide a secure, user-friendly experience that keeps pace with the ever-evolving world of film. From advanced search algorithms to personalized recommendations, we ensure that your journey through the world of cinema is seamless and enriching.
                        </p>
                    </div>

                    <div className="about-block">
                        <h2>Our Community</h2>
                        <p>
                            Our community is at the heart of PopRating. We work closely with cinephiles from around the world to create a space where everyone can share their love for film. Our platform offers the latest in movie reviews, ratings, and discussions, making it easy for you to stay informed and connected.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;