'use client'
import {useEffect,useState} from "react";

export default function ScrollTopTopButton(){
    const [isVisible,setIsVisible] = useState(false)
    
    const toggleVisibility = () => {
        if(window.pageYOffset > 300)
            setIsVisible(true)
        else
            setIsVisible(false)
    }

    const scrollToTop = () => {
        window.scrollTo({
            top:0,
            behavior: "smooth"
            }
        )
    }


    useEffect(() => {
        window.addEventListener("scroll",toggleVisibility)
        return () => window.removeEventListener("scroll",toggleVisibility)
    }, []);
    
    return(
        <div className={"scroll-to-top"}>
            {isVisible &&
                <div className="scroll-top-button" onClick={scrollToTop}>
                    <span className="material-symbols-outlined">arrow_upward</span>
                </div>
            }        </div>
    )
}