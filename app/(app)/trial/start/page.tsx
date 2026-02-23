'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles } from 'lucide-react';
import { PLANS, type PlanId, type BillingInterval } from '@/lib/config/plans.config';
import { format, addDays } from 'date-fns';

/**
 * Trial Activation Screen — shown once after sign-up when user selected a plan from /pricing.
 * Anchors trial end date, sets expectations, and links to onboarding.
 * Reads plan info from cp_selected_plan cookie, then clears it.
 */
export default function TrialStartPage() {
    const router = useRouter();
    const [planId, setPlanId] = useState<PlanId>('starter');
    const [billing, setBilling] = useState<BillingInterval>('monthly');
    const trialEndDate = addDays(new Date(), 7);

    useEffect(() => {
        // Read plan cookie
        const cookies = document.cookie.split(';').reduce<Record<string, string>>((acc, c) => {
            const [k, v] = c.trim().split('=');
            if (k && v) acc[k] = v;
            return acc;
        }, {});

        const raw = cookies['cp_selected_plan'];
        if (raw) {
            const [pId, bInterval] = raw.split(':');
            if (pId === 'starter' || pId === 'growth') setPlanId(pId);
            if (bInterval === 'monthly' || bInterval === 'yearly') setBilling(bInterval);
            // Clear cookie after reading
            document.cookie = 'cp_selected_plan=; path=/; max-age=0; SameSite=Lax';
        }
    }, []);

    const plan = PLANS[planId];

    return (
        <div className="min-h-screen bg-[#FFFCF2] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-lg">
                {/* Celebration */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-5">
                        <Sparkles className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#1A1A1D] mb-2">
                        You&apos;re in! 🎉
                    </h1>
                    <p className="text-lg text-[#52525B]">
                        Your 7-day <span className="font-semibold text-[#C1502E]">{plan.name}</span> trial has started.
                    </p>
                </div>

                {/* Info card */}
                <div className="rounded-2xl bg-white border border-[#E8E2D8] p-8 shadow-sm">
                    <p className="text-sm text-[#52525B] mb-1">Trial ends</p>
                    <p className="text-lg font-semibold text-[#1A1A1D] mb-6">
                        {format(trialEndDate, 'MMMM d, yyyy')}
                    </p>

                    <p className="text-sm font-medium text-[#1A1A1D] mb-3">What happens next:</p>
                    <ul className="space-y-3 mb-8">
                        {[
                            'Full access to all features',
                            'No charges for 7 days',
                            `Cancel anytime before ${format(trialEndDate, 'MMM d')}`,
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-sm text-[#374151]">
                                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => router.push('/onboarding')}
                        className="w-full h-12 rounded-lg bg-[#C1502E] text-white font-semibold text-sm hover:bg-[#E07A5F] transition-all shadow-md"
                    >
                        Set Up My Account →
                    </button>
                    <p className="text-center text-xs text-[#9CA3AF] mt-3">
                        Takes ~3 minutes
                    </p>
                </div>
            </div>
        </div>
    );
}
