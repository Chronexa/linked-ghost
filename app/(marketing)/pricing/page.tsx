'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { PLANS, type BillingInterval } from '@/lib/config/plans.config';
import { BillingToggle } from '@/components/pricing/billing-toggle';
import { PlanCard } from '@/components/pricing/plan-card';
import { PricingFAQ } from '@/components/pricing/pricing-faq';

export default function PricingPage() {
    const [billing, setBilling] = useState<BillingInterval>('yearly');
    const { isSignedIn } = useUser();
    const router = useRouter();

    const handleBottomCTA = () => {
        if (isSignedIn) {
            router.push('/settings/billing?plan=growth&billing=yearly');
        } else {
            router.push('/sign-up');
        }
    };

    return (
        <div className="bg-[#FFFCF2] min-h-screen pb-24">
            {/* SECTION 1 — Page Header */}
            <section className="pt-24 pb-12 text-center px-6">
                <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#C1502E] mb-4 border border-[#E8E2D8] px-3 py-1 rounded-full bg-white">
                    Simple, Transparent Pricing
                </span>

                <h1 className="font-display text-5xl font-semibold tracking-tight text-[#1A1A1D] mb-4 max-w-2xl mx-auto">
                    Your LinkedIn ghostwriter,<br />
                    <span className="text-[#C1502E]">for less than a coffee a day.</span>
                </h1>

                <p className="text-[#52525B] text-lg max-w-xl mx-auto mb-10">
                    Replace 2 hours of staring at a blank page with 3 minutes of review.
                    Cancel anytime. No contracts.
                </p>

                {/* SECTION 2 — Billing Toggle */}
                <BillingToggle billing={billing} setBilling={setBilling} />
            </section>

            {/* SECTION 4 — Social Proof / Trust Strip */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 py-6 px-6 text-sm text-[#52525B] max-w-4xl mx-auto mb-8">
                {[
                    '7-day free trial',
                    'No credit card required',
                    'Cancel anytime',
                    'Used by 50+ LinkedIn creators',
                ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#6B8E23]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{item}</span>
                    </div>
                ))}
            </div>

            {/* SECTION 3 — Plan Cards */}
            <section className="px-6 mx-auto max-w-4xl mb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PlanCard planId="starter" plan={PLANS.starter} billing={billing} />
                    <PlanCard planId="growth" plan={PLANS.growth} billing={billing} />
                </div>
            </section>

            {/* SECTION 5 — FAQ */}
            <section className="px-6 mx-auto max-w-4xl mb-24">
                <h2 className="font-display text-3xl font-semibold text-center text-[#1A1A1D] mb-10 tracking-tight">
                    Frequently asked questions
                </h2>
                <PricingFAQ />
            </section>

            {/* SECTION 6 — Bottom CTA Banner */}
            <section className="px-6 mx-auto max-w-3xl">
                <div className="rounded-2xl bg-[#1A1A1D] p-12 text-center shadow-2xl">
                    <h2 className="font-display text-3xl font-semibold text-white tracking-tight mb-3">
                        Stop staring at a blank page.
                    </h2>
                    <p className="text-[#9CA3AF] text-base mb-8 max-w-md mx-auto">
                        Join 50+ LinkedIn creators who generate their week&apos;s content
                        in under 15 minutes.
                    </p>
                    <button
                        onClick={handleBottomCTA}
                        className="inline-flex items-center h-12 px-8 rounded-lg bg-[#C1502E] text-white font-semibold text-sm hover:bg-[#E07A5F] transition-all shadow-md"
                    >
                        {isSignedIn ? 'Go to Billing →' : 'Start Your Free Trial →'}
                    </button>
                    <p className="text-xs text-[#6B7280] mt-4">
                        7 days free · No credit card · Cancel anytime
                    </p>
                </div>
            </section>
        </div>
    );
}
