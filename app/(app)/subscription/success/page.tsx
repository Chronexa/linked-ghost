'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { PLANS, type PlanId, type BillingInterval } from '@/lib/config/plans.config';
import { Check, ArrowRight } from 'lucide-react';
import { format, addMonths, addYears } from 'date-fns';

/**
 * Post-Payment Success Page — /subscription/success
 *
 * Shown once after Razorpay checkout succeeds.
 * Displays plan name, features unlocked, next billing date.
 * "Go to Dashboard" CTA.
 */
export default function SubscriptionSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { getToken } = useAuth();

    const pParam = searchParams.get('plan') as PlanId | null;
    const bParam = searchParams.get('billing') as BillingInterval | null;

    const planId: PlanId = pParam === 'starter' || pParam === 'growth' ? pParam : 'growth';
    const billing: BillingInterval = bParam === 'monthly' || bParam === 'yearly' ? bParam : 'monthly';
    const plan = PLANS[planId];

    const nextBilling = billing === 'yearly'
        ? format(addYears(new Date(), 1), 'MMMM d, yyyy')
        : format(addMonths(new Date(), 1), 'MMMM d, yyyy');

    // Trigger background poll to activate the subscription via webhook
    const [activated, setActivated] = useState(false);

    useEffect(() => {
        let attempts = 0;
        const poll = setInterval(async () => {
            try {
                const token = await getToken();
                const res = await fetch('/api/user/subscription', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.data?.status === 'active') {
                        setActivated(true);
                        clearInterval(poll);
                    }
                }
            } catch { /* ignore */ }
            attempts++;
            if (attempts >= 15) clearInterval(poll);
        }, 2000);

        return () => clearInterval(poll);
    }, [getToken]);

    return (
        <div className="min-h-screen bg-[#FFFCF2] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-lg text-center">
                {/* Success icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
                    <Check className="h-10 w-10 text-emerald-600" strokeWidth={3} />
                </div>

                <h1 className="text-3xl font-bold text-[#1A1A1D] mb-2">
                    You&apos;re on {plan.name}! ✨
                </h1>
                <p className="text-lg text-[#52525B] mb-8">
                    Welcome to ContentPilot {plan.name} Plan
                </p>

                {/* Features card */}
                <div className="rounded-2xl bg-white border border-[#E8E2D8] p-8 shadow-sm text-left mb-8">
                    <p className="text-sm font-medium text-[#1A1A1D] mb-4">What&apos;s unlocked:</p>
                    <ul className="space-y-3 mb-6">
                        {[
                            `${plan.limits.postsPerMonth} posts per month`,
                            `${plan.limits.pillars} content pillars`,
                            `${plan.limits.voiceExamples} voice training examples`,
                            plan.limits.regenerationsPerMonth === null
                                ? 'Unlimited regenerations'
                                : `${plan.limits.regenerationsPerMonth} regenerations / month`,
                            plan.features.prioritySupport ? 'Priority email support' : 'Email support',
                            'Daily AI topic discovery',
                            '3 post variants per topic (A/B/C)',
                        ].map((feat) => (
                            <li key={feat} className="flex items-center gap-3 text-sm text-[#374151]">
                                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                                {feat}
                            </li>
                        ))}
                    </ul>

                    <div className="border-t border-[#E8E2D8] pt-4">
                        <p className="text-sm text-[#52525B]">
                            Your next billing date: <span className="font-semibold text-[#1A1A1D]">{nextBilling}</span>
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-[#C1502E] text-white font-semibold text-sm hover:bg-[#E07A5F] transition-all shadow-md"
                >
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                </button>

                <p className="text-xs text-[#9CA3AF] mt-4">
                    Check your email for receipt
                </p>
            </div>
        </div>
    );
}
