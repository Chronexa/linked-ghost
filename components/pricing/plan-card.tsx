import Link from 'next/link';
import { PlanConfig, BillingInterval } from '@/lib/config/plans.config';
import { FeatureList } from './feature-list';

interface PlanCardProps {
    planId: 'starter' | 'growth';
    plan: PlanConfig;
    billing: BillingInterval;
}

export function PlanCard({ planId, plan, billing }: PlanCardProps) {
    const isGrowth = planId === 'growth';
    const price = billing === 'monthly' ? plan.monthlyPriceUsd : plan.yearlyMonthlyEquivalent;

    if (isGrowth) {
        return (
            <div className="relative rounded-2xl border-2 border-[#C1502E] bg-white p-8 flex flex-col shadow-[0_8px_30px_rgba(193,80,46,0.12)] transition-shadow duration-200 hover:shadow-[0_12px_40px_rgba(193,80,46,0.18)]">
                {/* Most Popular Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#C1502E] text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">
                        Most Popular
                    </span>
                </div>

                {/* Plan name */}
                <h3 className="font-display text-lg font-semibold text-[#1A1A1D]">
                    {plan.name}
                </h3>
                <p className="text-sm text-[#52525B] mt-1">
                    {plan.description}
                </p>

                {/* Price block */}
                <div className="mt-6 mb-8 min-h-[5rem]">
                    <div className="flex items-end gap-1">
                        <span className="font-display text-5xl font-semibold text-[#1A1A1D]">
                            ${price}
                        </span>
                        <span className="text-[#52525B] text-sm mb-2">/month</span>
                    </div>

                    {billing === 'yearly' && (
                        <p className="text-xs text-[#52525B] mt-1">
                            Billed ${plan.yearlyPriceUsd}/year —
                            <span className="line-through ml-1 opacity-60">
                                ${plan.monthlyPriceUsd * 12}
                            </span>
                        </p>
                    )}
                </div>

                {/* CTA Button */}
                <Link
                    href={`/sign-up?plan=${planId}`}
                    className="w-full h-11 flex items-center justify-center rounded-lg bg-[#C1502E] text-white font-medium text-sm hover:bg-[#A13D22] transition-all shadow-[0_2px_8px_rgba(193,80,46,0.08)]"
                >
                    Start Free Trial
                </Link>

                <p className="text-xs text-center text-[#52525B] mt-3">
                    7-day free trial · No credit card required
                </p>

                {/* Divider */}
                <div className="border-t border-[#E8E2D8] my-6" />

                {/* Feature list */}
                <FeatureList planId={planId} planConfig={plan} />
            </div>
        );
    }

    // Starter Plan
    return (
        <div className="relative rounded-2xl border border-[#E8E2D8] bg-white p-8 flex flex-col transition-shadow duration-200 hover:shadow-[0_8px_30px_rgba(193,80,46,0.08)]">
            {/* Plan name */}
            <h3 className="font-display text-lg font-semibold text-[#1A1A1D]">
                {plan.name}
            </h3>
            <p className="text-sm text-[#52525B] mt-1">
                {plan.description}
            </p>

            {/* Price block */}
            <div className="mt-6 mb-8 min-h-[5rem]">
                <div className="flex items-end gap-1">
                    <span key={billing} className="font-display text-5xl font-semibold text-[#1A1A1D] animate-in slide-in-from-bottom-2 fade-in duration-200">
                        ${price}
                    </span>
                    <span className="text-[#52525B] text-sm mb-2">/month</span>
                </div>

                {billing === 'yearly' && (
                    <p className="text-xs text-[#52525B] mt-1 animate-in fade-in duration-300 delay-100">
                        Billed ${plan.yearlyPriceUsd}/year —
                        <span className="line-through ml-1 opacity-60">
                            ${plan.monthlyPriceUsd * 12}
                        </span>
                    </p>
                )}
            </div>

            {/* CTA Button */}
            <Link
                href="/sign-up"
                className="w-full h-11 flex items-center justify-center rounded-lg border-2 border-[#1A1A1D] text-[#1A1A1D] font-medium text-sm hover:bg-[#1A1A1D] hover:text-white transition-all"
            >
                Start Free Trial
            </Link>

            <p className="text-xs text-center text-[#52525B] mt-3">
                7-day free trial · No credit card required
            </p>

            {/* Divider */}
            <div className="border-t border-[#E8E2D8] my-6" />

            {/* Feature list */}
            <FeatureList planId={planId} planConfig={plan} />
        </div>
    );
}
