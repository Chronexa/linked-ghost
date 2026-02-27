'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { AlertTriangle, BarChart3, X, Sparkles, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Trial Nudges — progressive urgency system across all 7 days.
 *
 * Day 1-2:  Welcome card — "Explore what's possible"
 * Day 3-4:  Usage stats card — "Here's what you've done so far"
 * Day 5-6:  Amber urgency banner — "X days left, don't lose access"
 * Day 7:    Red critical banner — "Trial expires today"
 */
export function TrialNudge() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [daysLeft, setDaysLeft] = useState<number | null>(null);
    const [trialEnd, setTrialEnd] = useState<string | null>(null);
    const [postsUsed, setPostsUsed] = useState(0);
    const [status, setStatus] = useState<string | null>(null);
    const [dismissed, setDismissed] = useState(false);

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

    // Check if user dismissed today
    useEffect(() => {
        const dismissedDate = sessionStorage.getItem('cp_nudge_dismiss_date');
        const today = new Date().toISOString().split('T')[0];
        if (dismissedDate === today) setDismissed(true);
    }, []);

    if (status !== 'trialing' || daysLeft === null) return null;

    const handleDismiss = () => {
        const today = new Date().toISOString().split('T')[0];
        sessionStorage.setItem('cp_nudge_dismiss_date', today);
        setDismissed(true);
    };

    // Day 7: Last day — dismissible only
    if (daysLeft <= 1 && trialEnd) {
        return (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-red-400/50 bg-red-50 px-5 py-4 shadow-sm mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-lg">🔴</span>
                    <div>
                        <p className="text-sm font-semibold text-red-800">
                            Trial expires {daysLeft === 0 ? 'today' : 'tomorrow'} — {format(new Date(trialEnd), 'MMMM d')}
                        </p>
                        <p className="text-xs text-red-600 mt-0.5">Your posts and pillars will pause after your trial ends.</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push('/billing')}
                    className="h-8 px-4 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors shrink-0"
                >
                    Upgrade Now
                </button>
            </div>
        );
    }

    // Days 5-6: Urgency warning — dismissible per day
    if (daysLeft <= 3 && !dismissed) {
        return (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-400/40 bg-amber-50 px-5 py-4 shadow-sm mb-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800">
                            {daysLeft} day{daysLeft !== 1 ? 's' : ''} left in your trial
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            You've created <strong>{postsUsed} post{postsUsed !== 1 ? 's' : ''}</strong> so far. Keep that momentum going.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => router.push('/billing')}
                        className="h-8 px-4 rounded-lg bg-[#C1502E] text-white text-xs font-semibold hover:bg-[#E07A5F] transition-colors"
                    >
                        Keep My Access
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

    // Days 3-4: Usage stats card — dismissible per day
    if (daysLeft <= 5 && !dismissed) {
        return (
            <div className="rounded-xl border border-[#E8E2D8] bg-white p-5 shadow-sm mb-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#1A1A1D]">
                        <BarChart3 className="h-4 w-4 text-[#C1502E]" />
                        Your trial so far — Day {7 - daysLeft} of 7
                    </div>
                    <button onClick={handleDismiss} className="opacity-40 hover:opacity-100">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
                <p className="text-sm text-[#52525B] mb-3">
                    Posts generated: <strong>{postsUsed}</strong>
                </p>
                <p className="text-sm text-[#52525B] mb-4">
                    {daysLeft} days left — don't stop now. Subscribe to keep everything.
                </p>
                <button
                    onClick={() => router.push('/billing')}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#C1502E] text-white text-sm font-semibold hover:bg-[#E07A5F] transition-colors"
                >
                    Upgrade Now — Keep Everything
                    <ArrowRight className="h-3 w-3" />
                </button>
            </div>
        );
    }

    // Days 1-2: Welcome card — dismissible
    if (!dismissed) {
        return (
            <div className="rounded-xl border border-[#C1502E]/20 bg-gradient-to-r from-[#C1502E]/5 to-amber-500/5 p-5 mb-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1D]">
                        <Sparkles className="h-4 w-4 text-[#C1502E]" />
                        You're on Day {7 - daysLeft} of your free trial
                    </div>
                    <button onClick={handleDismiss} className="opacity-40 hover:opacity-100">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
                <p className="text-sm text-[#52525B] mb-4">
                    You have full access to all features. Create your first post, set up pillars, and explore your AI ghostwriter — it's all free for 7 days.
                </p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/billing')}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1A1A1D] text-white text-xs font-semibold hover:bg-[#374151] transition-colors"
                    >
                        View Plans
                    </button>
                    <span className="text-xs text-[#9CA3AF]">{daysLeft} days remaining</span>
                </div>
            </div>
        );
    }

    return null;
}
