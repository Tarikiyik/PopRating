import React from 'react';
import '@/app/contactus/contact.css';


const Contact = () => {
    return (
        <div className="contact-container">
            <h1>Contact Us</h1>
            <p>Have questions or need assistance? We're here to help!</p>

            <div className="contact-details">
                <div className="contact-block">
                    <h2>Our Address</h2>
                    <p>
                        CRS Soft, Yıldız Teknopark, Çifte Havuzlar Mah.,<br/> Eski Londra Asfaltı Cad. No:151/1D,<br />
                        34220 Esenler, Istanbul, Turkey
                    </p>
                </div>

                <div className="contact-block">
                    <h2>Phone Numbers</h2>
                    <p>General Inquiries:<br/> (212) 456-7890</p>
                    <p><br/>Partnerships:<br/> (212) 456-7892</p>
                </div>

                <div className="contact-block">
                    <h2>Email Us</h2>
                    <p>General: contact@poprating.com</p>
                    <p>Support: support@poprating.com</p>
                    <p>Feedback: feedback@poprating.com</p>
                </div>

                <div className="contact-block">
                    <h2>Operating Hours</h2>
                    <p>Monday - Friday: <br />08:00 - 17:00</p>
                </div>
            </div>
        </div>
    );
}

export default Contact;