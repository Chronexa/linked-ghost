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

    const price = billing === 'yearly' ? plan.yearlyMonthlyEquivalent : plan.monthlyPriceUsd;
    const originalPrice = plan.monthlyPriceUsd;
    const isGrowth = planId === 'growth';

    const handleCTA = (e: React.MouseEvent) => {
        e.preventDefault();
        // Always set plan cookie before navigating — preserves intent through auth wall (24 hours for email verification)
        document.cookie = `cp_selected_plan=${planId}:${billing}; path=/; max-age=86400; SameSite=Lax`;

        if (isSignedIn) {
            // Signed-in → dedicated checkout page
            router.push(`/billing?plan=${planId}&billing=${billing}`);
        } else {
            // Not signed-in → auth, cookie carries plan intent
            router.push('/sign-up');
        }
    };

    return (
        <div className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition-shadow hover:shadow-lg
            ${isGrowth ? 'border-[#C1502E] ring-2 ring-[#C1502E]/20' : 'border-[#E8E2D8]'}`}>

            {/* Badge */}
            {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#C1502E] px-3 py-1 text-xs font-semibold text-white uppercase tracking-wide">
                    {plan.badge}
                </span>
            )}

            {/* Plan Name & Description */}
            <h3 className="text-xl font-bold text-[#1A1A1D] mt-2">{plan.name}</h3>
            <p className="text-sm text-[#52525B] mt-1">{plan.description}</p>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-[#1A1A1D]">${price}</span>
                <span className="text-base text-[#52525B]">/month</span>
            </div>
            {billing === 'yearly' && (
                <p className="text-sm text-[#52525B] mt-1">
                    Billed ${plan.yearlyPriceUsd}/year — <span className="line-through">${originalPrice}</span>
                </p>
            )}
            {billing === 'monthly' && (
                <p className="text-sm text-[#52525B] mt-1">&nbsp;</p>
            )}

            {/* CTA — Always "Start Free Trial" */}
            <button
                onClick={handleCTA}
                className={`mt-6 flex items-center justify-center h-12 w-full rounded-lg font-semibold text-sm transition-all
                    ${isGrowth
                        ? 'bg-[#C1502E] text-white hover:bg-[#E07A5F] shadow-md'
                        : 'border-2 border-[#1A1A1D] text-[#1A1A1D] hover:bg-[#1A1A1D] hover:text-white'
                    }`}
            >
                Start Free Trial
            </button>
            <p className="text-center text-xs text-[#9CA3AF] mt-2">
                7-day free trial · No credit card required
            </p>

            {/* Features */}
            <div className="mt-6 border-t border-[#E8E2D8] pt-6">
                <FeatureList planId={planId} planConfig={plan} />
            </div>
        </div>
    );
}
