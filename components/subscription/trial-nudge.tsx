'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { AlertTriangle, BarChart3, X } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Trial Day Nudges — progressive urgency system.
 *
 * Renders based on days left in trial:
 *   > 4 days: hidden
 *   3-4 days (Day 3–4): Compact usage card
 *   2 days (Day 5): Warning banner + [Start My Plan] + [Remind me tomorrow]
 *   1 day (Day 6): Red prominent banner
 */
export function TrialNudge() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [daysLeft, setDaysLeft] = useState<number | null>(null);
    const [trialEnd, setTrialEnd] = useState<string | null>(null);
    const [postsUsed, setPostsUsed] = useState(0);
    const [status, setStatus] = useState<string | null>(null);
    const [nudgeDismissedDate, setNudgeDismissedDate] = useState<string | null>(null);

    useEffect(() => {
        setNudgeDismissedDate(sessionStorage.getItem('cp_nudge_dismiss_date'));
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch('/api/user/subscription', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setStatus(data.data?.status ?? null);
                setTrialEnd(data.data?.trialEnd ?? null);
                setPostsUsed(data.data?.usage?.postsThisMonth ?? 0);
            }
        } catch { /* non-blocking */ }
    }, [getToken]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (!trialEnd) return;
        const days = Math.max(0, Math.ceil(
            (new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ));
        setDaysLeft(days);
    }, [trialEnd]);

    if (status !== 'trialing' || daysLeft === null || daysLeft > 4) return null;

    // Check if user dismissed today
    const today = new Date().toISOString().split('T')[0];
    if (nudgeDismissedDate === today && daysLeft > 1) return null;

    const handleDismiss = () => {
        sessionStorage.setItem('cp_nudge_dismiss_date', today);
        setNudgeDismissedDate(today);
    };

    // Day 3-4: Usage card
    if (daysLeft >= 3) {
        return (
            <div className="rounded-xl border border-[#E8E2D8] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#1A1A1D]">
                        <BarChart3 className="h-4 w-4 text-[#C1502E]" />
                        Your trial so far
                    </div>
                    <button onClick={handleDismiss} className="opacity-40 hover:opacity-100">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
                <p className="text-sm text-[#52525B] mb-3">
                    Posts generated: <strong>{postsUsed}</strong>
                </p>
                <p className="text-sm text-[#52525B] mb-4">
                    {daysLeft} days left to explore everything.
                </p>
                <button
                    onClick={() => router.push('/billing')}
                    className="h-9 px-4 rounded-lg bg-[#C1502E] text-white text-sm font-semibold hover:bg-[#E07A5F] transition-colors"
                >
                    Upgrade Now — Keep Everything
                </button>
            </div>
        );
    }

    // Day 5: Warning banner
    if (daysLeft === 2) {
        return (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-400/40 bg-amber-50 px-5 py-4 shadow-sm dark:bg-amber-950/20 dark:border-amber-700">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                            2 days left in your trial
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                            Your drafts and pillars will be paused after your trial ends.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => router.push('/billing')}
                        className="h-8 px-4 rounded-lg bg-[#C1502E] text-white text-xs font-semibold hover:bg-[#E07A5F] transition-colors"
                    >
                        Start My Plan
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="text-xs text-amber-600 hover:underline underline-offset-2"
                    >
                        Remind me tomorrow
                    </button>
                </div>
            </div>
        );
    }

    // Day 6: Prominent red banner
    if (daysLeft === 1 && trialEnd) {
        return (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-red-400/40 bg-red-50 px-5 py-4 shadow-sm dark:bg-red-950/20 dark:border-red-700">
                <div className="flex items-center gap-3">
                    <span className="text-lg">🔴</span>
                    <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                        Trial expires tomorrow — {format(new Date(trialEnd), 'MMMM d')}
                    </p>
                </div>
                <button
                    onClick={() => router.push('/billing')}
                    className="h-8 px-4 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors shrink-0"
                >
                    Upgrade Now to Keep Access
                </button>
            </div>
        );
    }

    return null;
}
