'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

/**
 * Persistent trial banner — stays at top of app shell during trial period.
 * Shows "🕐 Trial: X days remaining · Ends [date]" with "Upgrade" link.
 * Dismissable per session on days 1-4; always visible on days 5+.
 */
export function TrialBanner() {
    const { getToken } = useAuth();
    const [trialEnd, setTrialEnd] = useState<string | null>(null);
    const [daysLeft, setDaysLeft] = useState<number | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [dismissed, setDismissed] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch('/api/user/subscription', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setStatus(data.data?.status ?? null);
                setTrialEnd(data.data?.trialEnd ?? null);
            }
        } catch { /* non-blocking */ }
    }, [getToken]);

    useEffect(() => { fetchStatus(); }, [fetchStatus]);

    useEffect(() => {
        if (!trialEnd) return;
        const days = Math.max(0, Math.ceil(
            (new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ));
        setDaysLeft(days);
    }, [trialEnd]);

    // Only show during trial
    if (status !== 'trialing' || daysLeft === null || !trialEnd) return null;
    // Day 5+ banner can't be dismissed
    if (dismissed && daysLeft > 2) return null;

    const urgencyColor = daysLeft <= 1
        ? 'bg-red-50 border-red-300 text-red-800 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800'
        : daysLeft <= 2
            ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800'
            : 'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800';

    return (
        <div className={`flex items-center justify-between gap-3 border-b px-4 py-2 text-sm ${urgencyColor}`}>
            <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>
                    Trial: <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</strong>
                    {' · '}Ends {format(new Date(trialEnd), 'MMM d')}
                </span>
            </div>
            <div className="flex items-center gap-3">
                <Link
                    href="/billing"
                    className="text-xs font-semibold underline-offset-2 hover:underline"
                >
                    Upgrade now
                </Link>
                {daysLeft > 2 && (
                    <button onClick={() => setDismissed(true)} className="opacity-60 hover:opacity-100">
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
