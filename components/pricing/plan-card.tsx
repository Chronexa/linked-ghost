'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { PlanConfig, BillingInterval } from '@/lib/config/plans.config';
import { FeatureList } from './feature-list';

interface PlanCardProps {
    planId: 'starter' | 'growth';
    plan: PlanConfig;
    billing: BillingInterval;
}

export function PlanCard({ planId, plan, billing }: PlanCardProps) {
    const { isSignedIn } = useUser();
    const router = useRouter();
    const isGrowth = planId === 'growth';
    const price = billing === 'monthly' ? plan.monthlyPriceUsd : plan.yearlyMonthlyEquivalent;

    // If already signed in → go to billing in the app.
    // If not → go to sign-up and then to billing after auth.
    const signUpHref = planId === 'growth' ? '/sign-up?plan=growth' : '/sign-up';
    const billingHref = `/settings?tab=billing&plan=${planId}&billing=${billing}`;
    const ctaHref = isSignedIn ? billingHref : signUpHref;

    const handleCTA = (e: React.MouseEvent) => {
        e.preventDefault();
        router.push(ctaHref);
    };

    if (isGrowth) {
        return (
            <div className="relative rounded-2xl border-2 border-[#C1502E] bg-white p-8 flex flex-col shadow-[0_8px_30px_rgba(193,80,46,0.12)] transition-shadow duration-200 hover:shadow-[0_12px_40px_rgba(193,80,46,0.18)]">
                {/* Most Popular Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#C1502E] text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">
                        Most Popular
                    </span>
                </div>

                <h3 className="font-display text-lg font-semibold text-[#1A1A1D]">{plan.name}</h3>
                <p className="text-sm text-[#52525B] mt-1">{plan.description}</p>

                <div className="mt-6 mb-8 min-h-[5rem]">
                    <div className="flex items-end gap-1">
                        <span key={billing} className="font-display text-5xl font-semibold text-[#1A1A1D]">${price}</span>
                        <span className="text-[#52525B] text-sm mb-2">/month</span>
                    </div>
                    {billing === 'yearly' && (
                        <p className="text-xs text-[#52525B] mt-1">
                            Billed ${plan.yearlyPriceUsd}/year —
                            <span className="line-through ml-1 opacity-60">${plan.monthlyPriceUsd * 12}</span>
                        </p>
                    )}
                </div>

                <button
                    onClick={handleCTA}
                    className="w-full h-11 flex items-center justify-center rounded-lg bg-[#C1502E] text-white font-medium text-sm hover:bg-[#A13D22] transition-all shadow-[0_2px_8px_rgba(193,80,46,0.08)]"
                >
                    {isSignedIn ? 'Subscribe Now' : 'Start Free Trial'}
                </button>
                <p className="text-xs text-center text-[#52525B] mt-3">7-day free trial · No credit card required</p>

                <div className="border-t border-[#E8E2D8] my-6" />
                <FeatureList planId={planId} planConfig={plan} />
            </div>
        );
    }

    return (
        <div className="relative rounded-2xl border border-[#E8E2D8] bg-white p-8 flex flex-col transition-shadow duration-200 hover:shadow-[0_8px_30px_rgba(193,80,46,0.08)]">
            <h3 className="font-display text-lg font-semibold text-[#1A1A1D]">{plan.name}</h3>
            <p className="text-sm text-[#52525B] mt-1">{plan.description}</p>

            <div className="mt-6 mb-8 min-h-[5rem]">
                <div className="flex items-end gap-1">
                    <span key={billing} className="font-display text-5xl font-semibold text-[#1A1A1D]">${price}</span>
                    <span className="text-[#52525B] text-sm mb-2">/month</span>
                </div>
                {billing === 'yearly' && (
                    <p className="text-xs text-[#52525B] mt-1">
                        Billed ${plan.yearlyPriceUsd}/year —
                        <span className="line-through ml-1 opacity-60">${plan.monthlyPriceUsd * 12}</span>
                    </p>
                )}
            </div>

            <button
                onClick={handleCTA}
                className="w-full h-11 flex items-center justify-center rounded-lg border-2 border-[#1A1A1D] text-[#1A1A1D] font-medium text-sm hover:bg-[#1A1A1D] hover:text-white transition-all"
            >
                {isSignedIn ? 'Subscribe Now' : 'Start Free Trial'}
            </button>
            <p className="text-xs text-center text-[#52525B] mt-3">7-day free trial · No credit card required</p>

            <div className="border-t border-[#E8E2D8] my-6" />
            <FeatureList planId={planId} planConfig={plan} />
        </div>
    );
}
