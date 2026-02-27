'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth, useUser as useClerkUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, Zap, Lightbulb, Sparkles, ArrowRight, Clock, Activity } from 'lucide-react';
import { useUser } from '@/lib/hooks/use-user';
import { ChatInput } from './ChatInput';
import { format } from 'date-fns';

interface EmptyStateDashboardProps {
    onResearchIdeas: () => void;
    onQuickPost: () => void;
}

interface SubData {
    status: string | null;
    trialEnd?: string | null;
    planId?: string;
}

export function EmptyStateDashboard({ onResearchIdeas, onQuickPost }: EmptyStateDashboardProps) {
    const { getToken } = useAuth();
    const { user: clerkUser } = useClerkUser();
    const { data: userData } = useUser();
    const profile = (userData as any)?.data?.profile;
    const router = useRouter();
    const [subData, setSubData] = useState<SubData | null>(null);
    const [daysLeft, setDaysLeft] = useState<number | null>(null);

    const fetchSubData = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch('/api/user/subscription', { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const json = await res.json();
                setSubData(json.data ?? null);
            }
        } catch { /* non-blocking */ }
    }, [getToken]);

    useEffect(() => { fetchSubData(); }, [fetchSubData]);

    useEffect(() => {
        if (!subData?.trialEnd) return;
        const days = Math.max(0, Math.ceil(
            (new Date(subData.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ));
        setDaysLeft(days);
    }, [subData]);

    const isTrialing = subData?.status === 'trialing';
    const firstName = clerkUser?.firstName || '';

    // Voice Confidence Calculation
    const postsCount = profile?.postsCount || 0;
    const isVoiceTrained = !!profile?.voiceEmbedding;
    const baseScore = isVoiceTrained ? 65 : 15;
    const dynamicScore = Math.min(98, baseScore + (postsCount * 3));
    const nextMilestone = Math.min(98, Math.ceil(dynamicScore / 10) * 10 + 5);
    const postsNeeded = Math.max(1, Math.ceil((nextMilestone - dynamicScore) / 3));



    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] w-full max-w-5xl mx-auto px-6 animate-in fade-in duration-500">

            {/* Trial urgency bar — shown for trial users */}
            {isTrialing && daysLeft !== null && (
                <div className="w-full max-w-2xl mb-8 rounded-xl border border-[#C1502E]/20 bg-gradient-to-r from-[#C1502E]/5 to-amber-500/5 px-5 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-[#C1502E] shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-[#1A1A1D]">
                                Day {7 - daysLeft + 1} of 7 — {subData?.planId === 'growth' ? 'Growth' : 'Starter'} Trial
                            </p>
                            <p className="text-xs text-[#52525B]">
                                {daysLeft > 0
                                    ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining${subData?.trialEnd ? ` · Ends ${format(new Date(subData.trialEnd), 'MMM d')}` : ''}`
                                    : 'Trial expires today'
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/billing')}
                        className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-[#C1502E] hover:text-[#E07A5F] transition-colors whitespace-nowrap"
                    >
                        Upgrade Now <ArrowRight className="h-3 w-3" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="text-center mb-10 space-y-4 max-w-2xl flex flex-col items-center">
                {/* Voice Confidence Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-brand/5 border border-brand/20 rounded-full mb-2 hover:bg-brand/10 transition-colors cursor-default">
                    <Activity className="w-4 h-4 text-brand" />
                    <span className="text-xs font-semibold text-brand-text">
                        Voice Match: {dynamicScore}%
                    </span>
                    <span className="text-xs text-charcoal-light border-l border-brand/20 pl-2">
                        Approve {postsNeeded} more post{postsNeeded !== 1 ? 's' : ''} to reach {nextMilestone}%
                    </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-charcoal">
                    {firstName ? (
                        <>Welcome{isTrialing ? ' back' : ''}, {firstName} 👋</>
                    ) : (
                        'ContentPilot AI'
                    )}
                </h1>
                <p className="text-charcoal-light text-xl leading-relaxed">
                    {isTrialing
                        ? 'Your AI LinkedIn Ghostwriter is ready. What would you like to create?'
                        : 'Your AI LinkedIn Ghostwriter. What would you like to create today?'
                    }
                </p>
            </div>

            {/* Action cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
                {/* Research Ideas */}
                <button
                    onClick={onResearchIdeas}
                    className="text-left rounded-2xl border border-[#E8E2D8] bg-white p-6 shadow-sm hover:border-[#C1502E]/30 hover:shadow-md transition-all duration-300 group"
                >
                    <div className="mb-4 p-3 bg-[#C1502E]/5 w-fit rounded-xl text-[#C1502E] group-hover:bg-[#C1502E] group-hover:text-white transition-colors duration-300">
                        <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A1D] mb-1">Research Ideas</h3>
                    <p className="text-sm text-[#52525B] mb-3">Find trending topics matching your content pillars</p>
                    <p className="text-sm text-[#9CA3AF] leading-relaxed">
                        I'll browse the web for the latest opportunities in your niche and suggest high-performing angles.
                    </p>
                </button>

                {/* Quick Post */}
                <button
                    onClick={onQuickPost}
                    className="text-left rounded-2xl border border-[#C1502E]/20 bg-gradient-to-br from-[#C1502E]/5 to-amber-500/5 p-6 shadow-sm hover:border-[#C1502E]/40 hover:shadow-md transition-all duration-300 group"
                >
                    <div className="mb-4 p-3 bg-[#C1502E] w-fit rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A1D] mb-1">Quick Post</h3>
                    <p className="text-sm text-[#52525B] mb-3">Fast-track: Idea → 3 Variants in 30 seconds</p>
                    <p className="text-sm text-[#9CA3AF] leading-relaxed">
                        Skip the chat. Enter an idea and get 3 distinct post styles instantly — Bold, Pro, and Casual.
                    </p>
                    {isTrialing && (
                        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#C1502E]">
                            <Sparkles className="h-3 w-3" />
                            Try it free — no credit card needed
                        </div>
                    )}
                </button>
            </div>

        </div>
    );
}
