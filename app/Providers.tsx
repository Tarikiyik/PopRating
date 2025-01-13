'use client';

import { SessionProvider } from "next-auth/react";
import * as React from "react";
import { NextUIProvider } from "@nextui-org/react";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export function Providers({ children }: { children: React.ReactNode }) {
    const reCaptchaKey: string | undefined = process?.env?.NEXT_PUBLIC_RECAPTCHA_KEY
    
    return (
        <SessionProvider>
            <NextUIProvider>
                <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey ?? 'not defined'}>
                    {children}
                </GoogleReCaptchaProvider>
            </NextUIProvider>
        </SessionProvider>
    );
}