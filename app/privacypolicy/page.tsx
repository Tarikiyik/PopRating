import React from 'react';
import '@/app/privacypolicy/privacy.css';

const PrivacyPolicy = () => {
    return (
        <div className="privacy-container">
            <h1>Privacy Policy</h1>
            <p>At PopRating, your privacy is of utmost importance to us. This Privacy Policy outlines how we collect,
                use, and protect your personal information.</p>

            <div className="privacy-details">
                <div className="privacy-block">
                    <h2>Information We Collect</h2>
                    <p>
                        We collect personal information that you provide to us when you use our services, such as when
                        you create an account, rate a show, or contact customer support. This information may include
                        your name, email address, payment details, and other contact information.
                    </p>
                    <p>
                        We may also collect non-personal information automatically when you interact with our website,
                        including your IP address, browser type, and operating system. This helps us to improve our
                        services and enhance your experience.
                    </p>
                </div>

                <div className="privacy-block">
                    <h2>How We Use Your Information</h2>
                    <p>
                        The information we collect is used to provide and improve our services, process your
                        transactions, communicate with you, and ensure the security of our platform. We may also use
                        your information to personalize your experience and provide you with relevant content and
                        offers.
                    </p>
                    <p>
                        We do not share your personal information with third parties except as necessary to provide our
                        services, comply with legal obligations, or protect our rights.
                    </p>
                </div>

                <div className="privacy-block">
                    <h2>Your Rights and Choices</h2>
                    <p>
                        You have the right to access, update, or delete your personal information at any time by logging
                        into your account or contacting our support team. You may also choose to opt-out of receiving
                        promotional communications from us.
                    </p>
                    <p>
                        If you have any concerns about how your information is being used, please reach out to us, and
                        we will do our best to address your concerns.
                    </p>
                </div>

                <div className="privacy-block">
                    <h2>Data Security</h2>
                    <p>
                        We take the security of your personal information seriously and implement industry-standard
                        measures to protect it from unauthorized access, disclosure, or misuse. However, no method of
                        transmission over the internet is completely secure, so we cannot guarantee its absolute
                        security.
                    </p>
                </div>

                <div className="privacy-block">
                    <h2>Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time to reflect changes in our practices or for
                        other operational, legal, or regulatory reasons. We encourage you to review this policy
                        periodically for the latest information on our privacy practices.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default PrivacyPolicy;