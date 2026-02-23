import { PlanConfig } from '@/lib/config/plans.config';

export function FeatureList({ planId, planConfig }: { planId: 'starter' | 'growth'; planConfig: PlanConfig }) {
    const isGrowth = planId === 'growth';
    const Checkmark = () => (
        <svg className="w-4 h-4 text-[#6B8E23] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    );

    return (
        <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm text-[#1A1A1D]">
                <Checkmark />
                <span><strong className="font-semibold">{planConfig.limits.postsPerMonth}</strong> LinkedIn posts per month</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-[#1A1A1D]">
                <Checkmark />
                <span><strong className="font-semibold">{planConfig.limits.pillars}</strong> content pillars</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-[#1A1A1D]">
                <Checkmark />
                <span><strong className="font-semibold">{planConfig.limits.voiceExamples}</strong> voice training examples</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-[#1A1A1D]">
                <Checkmark />
                <span>{planConfig.limits.regenerationsPerMonth === null ? 'Unlimited' : planConfig.limits.regenerationsPerMonth} regenerations per month</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-[#1A1A1D]">
                <Checkmark />
                <span>Daily AI topic discovery</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-[#1A1A1D]">
                <Checkmark />
                <span>3 post variants per topic (A/B/C)</span>
            </li>

            {isGrowth ? (
                <>
                    <li className="flex items-start gap-3 text-sm text-[#1A1A1D]">
                        <Checkmark />
                        <span>Advanced voice matching</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-[#1A1A1D]">
                        <Checkmark />
                        <span>Priority email support</span>
                    </li>
                </>
            ) : (
                <>
                    <li className="flex items-start gap-3 text-sm text-[#1A1A1D]">
                        <Checkmark />
                        <span>Email support</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-[#52525B] line-through opacity-50">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Priority support</span>
                    </li>
                </>
            )}
        </ul>
    );
}
