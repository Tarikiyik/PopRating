import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return ( 
        <footer className="footer">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                <img className={"logo-footer"} src={'/images/logo/poprating-logo-d.png'}/>
                <p>&copy; {new Date().getFullYear()} PopRating. All rights reserved.</p>
                </div>
                <ul className="list-disc text-left space-y-4">
                    <li><Link href="/aboutus" className="hover:underline">About Us</Link></li>
                    <li><Link href="/contactus" className="hover:underline">Contact Us</Link></li>
                    <li><Link href="/privacypolicy" className="hover:underline">Privacy Policy</Link></li>
                </ul>
            </div>
        </footer>
    );
}

export default Footer;