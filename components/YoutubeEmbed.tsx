import React from 'react';

interface YouTubeEmbedProps {
    videoUrl: string;
}    

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoUrl }) => {
    const getEmbedUrl = (url: string) => {
        const videoId = url.split('v=')[1];
        const ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
            return `https://www.youtube.com/embed/${videoId.substring(0, ampersandPosition)}`;
        }
        return `https://www.youtube.com/embed/${videoId}`;
    }; 

    return (
        <div className="youtube-embed">
            <iframe
                className={"youtube-box"}
                src={getEmbedUrl(videoUrl)}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default YouTubeEmbed;