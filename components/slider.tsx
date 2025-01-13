'use client'
import React, { useEffect, useRef } from 'react';

interface SliderProps {
    children: React.ReactNode;
}

const Slider: React.FC<SliderProps> = ({ children }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const scrollAmount = useRef(0);
    const scrollPerClick = useRef(0);

    useEffect(() => {
        const sliderBox = sliderRef.current;

        if (sliderBox) {
            const sliders = sliderBox.querySelectorAll(".slider-item");
            scrollPerClick.current = sliders[0]?.clientWidth + 100;

            const handlePrevClick = () => {
                scrollAmount.current = Math.max(scrollAmount.current - scrollPerClick.current, 0);
                sliderBox.scrollTo({
                    left: scrollAmount.current,
                    behavior: "smooth",
                });
            };

            const handleNextClick = () => {
                const maxScroll = sliderBox.scrollWidth - sliderBox.clientWidth;
                scrollAmount.current = Math.min(scrollAmount.current + scrollPerClick.current, maxScroll);
                sliderBox.scrollTo({
                    left: scrollAmount.current,
                    behavior: "smooth",
                });
            };

            const prevButton = sliderBox.parentElement?.querySelector(".slider-button.prev");
            const nextButton = sliderBox.parentElement?.querySelector(".slider-button.next");

            prevButton?.addEventListener("click", handlePrevClick);
            nextButton?.addEventListener("click", handleNextClick);

            return () => {
                prevButton?.removeEventListener("click", handlePrevClick);
                nextButton?.removeEventListener("click", handleNextClick);
            };
        }
    }, []);

    return (
        <div className="home-slider">
            <div className="slider-box" ref={sliderRef}>
                {children}
            </div>
            <button className="material-symbols-outlined slider-button prev">
                <span>arrow_back_ios</span>
            </button>
            <button className="material-symbols-outlined slider-button next">
                <span>arrow_forward_ios</span>
            </button>
        </div>
    );
};

export default Slider;