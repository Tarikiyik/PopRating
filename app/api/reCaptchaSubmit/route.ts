import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    const postData = await request.json();
    const { gRecaptchaToken } = postData;

    let verificationResponse;

    try {
        const res = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${secretKey}&response=${gRecaptchaToken}`,
        });

        verificationResponse = await res.json();
    } catch (error) {
        return NextResponse.json({ success: false, error: "Recaptcha verification failed." });
    }

    if (verificationResponse?.success && verificationResponse?.score > 0.5) {
        console.log("Verification Score:", verificationResponse.score);

        return NextResponse.json({
            success: true,
            score: verificationResponse.score,
        });
    } else {
        return NextResponse.json({ success: false, error: "Recaptcha verification failed or score too low." });
    }
}