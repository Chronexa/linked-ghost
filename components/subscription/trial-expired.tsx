'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { PLANS, type PlanId, type BillingInterval } from '@/lib/config/plans.config';

/**
 * Trial Expired — full-screen overlay.
 *
 * Shown when trial has ended (daysLeft === 0 or status is 'halted'/'canceled').
 * Blocks the app behind it. NOT easily dismissable.
 * Small "I'll do this later" link at bottom (no X button).
 */
export function TrialExpired() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [show, setShow] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [daysLeft, setDaysLeft] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch('/api/user/subscription', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setStatus(data.data?.status ?? null);
                const trialEnd = data.data?.trialEnd;
                if (trialEnd) {
                    const days = Math.max(0, Math.ceil(
                        (new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    ));
                    setDaysLeft(days);
                }
            }
        } catch { /* non-blocking */ }
    }, [getToken]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        // Show when trial expired OR subscription is not active
        const isExpired = (status === 'trialing' && daysLeft !== null && daysLeft <= 0);
        const isHalted = status === 'halted' || status === 'canceled';
        // Don't show if user already has active subscription
        const isActive = status === 'active';

        if ((isExpired || isHalted) && !isActive) {
            // Check session flag — allow "later" once per session
            const dismissed = sessionStorage.getItem('cp_expired_dismissed');
            if (!dismissed) setShow(true);
        }
    }, [status, daysLeft]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-lg mx-4 rounded-2xl bg-white p-10 text-center shadow-2xl">
                <h2 className="text-2xl font-bold text-[#1A1A1D] mb-3">Your trial has ended</h2>
                <p className="text-[#52525B] mb-8">
                    Everything you built is safe. Subscribe to continue posting.
                </p>

                {/* Plan options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {(['starter', 'growth'] as PlanId[]).map((planId) => {
                        const plan = PLANS[planId];
                        const isGrowth = planId === 'growth';
                        return (
                            <div
                                key={planId}
                                className={`rounded-xl border p-5 text-left transition-shadow hover:shadow-md
                                    ${isGrowth ? 'border-[#C1502E] ring-1 ring-[#C1502E]/20' : 'border-[#E8E2D8]'}`}
                            >
                                <h3 className="text-sm font-semibold text-[#1A1A1D] mb-1">{plan.name}</h3>
                                <p className="text-2xl font-bold text-[#1A1A1D] mb-1">
                                    ${plan.monthlyPriceUsd}<span className="text-sm font-normal text-[#52525B]">/mo</span>
                                </p>
                                <p className="text-xs text-[#9CA3AF] mb-4">{plan.limits.postsPerMonth} posts/mo</p>
                                {isGrowth && (
                                    <span className="text-[10px] uppercase tracking-wide font-semibold text-[#C1502E] mb-3 inline-block">
                                        Recommended
                                    </span>
                                )}
                                <button
                                    onClick={() => router.push(`/billing?plan=${planId}&billing=monthly`)}
                                    className={`w-full h-9 rounded-lg text-sm font-semibold transition-all
                                        ${isGrowth
                                            ? 'bg-[#C1502E] text-white hover:bg-[#E07A5F]'
                                            : 'border border-[#1A1A1D] text-[#1A1A1D] hover:bg-[#1A1A1D] hover:text-white'
                                        }`}
                                >
                                    Subscribe Now
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Dismissable, but just a small link */}
                <button
                    onClick={() => {
                        sessionStorage.setItem('cp_expired_dismissed', 'true');
                        setShow(false);
                    }}
                    className="text-xs text-[#9CA3AF] hover:text-[#52525B] underline-offset-2 hover:underline transition-colors"
                >
                    I&apos;ll do this later
                </button>
            </div>
        </div>
    );
}
