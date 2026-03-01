"use client";

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';

function PostHogAuthWrapper({ children }: { children: ReactNode }) {
    const { userId, isLoaded } = useAuth();
    const ph = usePostHog();

    useEffect(() => {
        if (isLoaded && ph) {
            if (userId) {
                ph.identify(userId);
            } else {
                ph.reset(); // Clear session if user logs out
            }
        }
    }, [userId, isLoaded, ph]);

    return <>{children}</>;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
        const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

        if (!key) return;

        posthog.init(key, {
            api_host: host,
            capture_pageview: true,
            capture_pageleave: true,
            session_recording: {
                maskAllInputs: true,
            },
            loaded: (phInstance) => {
                // Disable in development
                if (process.env.NODE_ENV === 'development') {
                    phInstance.opt_out_capturing();
                }
            },
        });
    }, []);

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return <>{children}</>;

    return (
        <PHProvider client={posthog}>
            <PostHogAuthWrapper>{children}</PostHogAuthWrapper>
        </PHProvider>
    );
}
