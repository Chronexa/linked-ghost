'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { PLANS, type PlanId, type BillingInterval } from '@/lib/config/plans.config';
import { format, addDays } from 'date-fns';
import { Sparkles, Check, ArrowRight, X } from 'lucide-react';

/**
 * Trial Activation Screen — shown once after sign-up.
 * Premium animated celebration with plan-specific messaging.
 * Works for ALL signup methods (Google OAuth, email/password).
 * Reads plan from cookie (or defaults to Growth if missing).
 */
export default function TrialStartPage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const { user } = useUser();
    const [planId, setPlanId] = useState<PlanId>('growth');
    const [billing, setBilling] = useState<BillingInterval>('monthly');
    const [animStep, setAnimStep] = useState(0); // Controls staggered animations
    const [showSkip, setShowSkip] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);
    const trialEndDate = addDays(new Date(), 7);

    const handleSkip = async () => {
        if (isSkipping) return;
        setIsSkipping(true);
        try {
            await fetch('/api/onboarding/confirm-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    confirmedPillarIds: [],
                    removedPillarIds: [],
                    voiceArchetype: 'expert',
                }),
            });
        } catch (error) {
            console.error('Failed to set onboarding complete flag', error);
        } finally {
            // CRITICAL: refresh() forces Next.js to re-fetch the Clerk JWT so that
            // the onboardingComplete=true metadata is picked up by middleware.
            // Without this, middleware loops back to /trial/start.
            router.refresh();
            await new Promise((resolve) => setTimeout(resolve, 300));
            router.push('/dashboard');
        }
    };

    useEffect(() => {
        const activateFreeTrial = async (pId: string, bInt: string) => {
            try {
                const token = await getToken();
                await fetch('/api/billing/activate-trial', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ planId: pId, billingInterval: bInt })
                });
            } catch (error) {
                console.error('Failed to notify backend of trial start.', error);
            }
        };

        // Read plan cookie (set from pricing page)
        const cookies = document.cookie.split(';').reduce<Record<string, string>>((acc, c) => {
            const [k, v] = c.trim().split('=');
            if (k && v) acc[k] = v;
            return acc;
        }, {});

        const raw = cookies['cp_selected_plan'];
        let pId: PlanId = 'growth'; // default to most popular
        let bInt: BillingInterval = 'monthly';

        if (raw) {
            const [p, b] = raw.split(':');
            if (p === 'starter' || p === 'growth') pId = p as PlanId;
            if (b === 'monthly' || b === 'yearly') bInt = b as BillingInterval;
            // Clear cookie after reading
            document.cookie = 'cp_selected_plan=; path=/; max-age=0; SameSite=Lax';
        }

        setPlanId(pId);
        setBilling(bInt);

        // Link backend trial state
        activateFreeTrial(pId, bInt);

        // Staggered animations
        const timers = [
            setTimeout(() => setAnimStep(1), 200),
            setTimeout(() => setAnimStep(2), 600),
            setTimeout(() => setAnimStep(3), 1000),
            setTimeout(() => setAnimStep(4), 1400),
            setTimeout(() => setShowSkip(true), 2000),
        ];

        return () => timers.forEach(clearTimeout);
    }, [getToken]);

    const plan = PLANS[planId];
    const firstName = user?.firstName || 'there';

    const features = [
        `Full access to ${plan.name} plan features`,
        `${plan.limits.postsPerMonth} AI-generated posts per month`,
        `${plan.limits.pillars} content pillars for topic organization`,
        'No charges for the first 7 days',
        `Cancel anytime before ${format(trialEndDate, 'MMM d')}`,
    ];

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
            {/* Background */}
            <div className="absolute inset-0 bg-[#0F0F12]" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#C1502E]/10 via-transparent to-[#8B5CF6]/10" />

            {/* Animated orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C1502E]/8 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#8B5CF6]/8 rounded-full blur-3xl animate-pulse delay-1000" />

            {/* Confetti particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full opacity-0"
                        style={{
                            left: `${10 + (i * 8)}%`,
                            top: '-20px',
                            backgroundColor: i % 3 === 0 ? '#C1502E' : i % 3 === 1 ? '#F59E0B' : '#8B5CF6',
                            animation: animStep >= 1 ? `confettiFall ${1.5 + (i * 0.1)}s ${i * 0.1}s ease-in forwards` : 'none',
                        }}
                    />
                ))}
            </div>

            {/* Skip button */}
            {showSkip && (
                <button
                    onClick={handleSkip}
                    disabled={isSkipping}
                    className="absolute top-6 right-6 flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors disabled:opacity-50"
                >
                    <X className="h-3.5 w-3.5" />
                    {isSkipping ? 'Skipping...' : 'Skip for now'}
                </button>
            )}

            {/* Main card */}
            <div className="relative z-10 w-full max-w-lg">

                {/* Celebration emoji / icon */}
                <div
                    className="text-center mb-8 transition-all duration-700"
                    style={{
                        opacity: animStep >= 1 ? 1 : 0,
                        transform: animStep >= 1 ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
                    }}
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#C1502E] to-[#E07A5F] shadow-lg shadow-[#C1502E]/30 mb-6">
                        <Sparkles className="h-10 w-10 text-white" />
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C1502E]/20 border border-[#C1502E]/30 mb-5">
                        <span className="text-[#E07A5F] text-sm font-semibold">7 DAYS FREE</span>
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-2">
                        You&apos;re in, {firstName}! 🎉
                    </h1>
                    <p className="text-lg text-white/60">
                        Your{' '}
                        <span className="text-[#E07A5F] font-semibold">{plan.name}</span>{' '}
                        trial starts now.
                    </p>
                </div>

                {/* Trial end date */}
                <div
                    className="text-center mb-8 transition-all duration-700"
                    style={{
                        opacity: animStep >= 2 ? 1 : 0,
                        transform: animStep >= 2 ? 'translateY(0)' : 'translateY(16px)',
                    }}
                >
                    <p className="text-white/40 text-sm mb-1">Trial ends</p>
                    <p className="text-2xl font-semibold text-white">
                        {format(trialEndDate, 'MMMM d, yyyy')}
                    </p>
                </div>

                {/* Feature list */}
                <div
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6 transition-all duration-700"
                    style={{
                        opacity: animStep >= 3 ? 1 : 0,
                        transform: animStep >= 3 ? 'translateY(0)' : 'translateY(16px)',
                    }}
                >
                    <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
                        What&apos;s included
                    </p>
                    <ul className="space-y-3">
                        {features.map((item, i) => (
                            <li
                                key={item}
                                className="flex items-center gap-3 text-sm text-white/80 transition-all duration-500"
                                style={{
                                    opacity: animStep >= 3 ? 1 : 0,
                                    transform: animStep >= 3 ? 'translateX(0)' : 'translateX(-12px)',
                                    transitionDelay: `${i * 80}ms`,
                                }}
                            >
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Check className="h-3 w-3 text-emerald-400" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CTA */}
                <div
                    className="transition-all duration-700"
                    style={{
                        opacity: animStep >= 4 ? 1 : 0,
                        transform: animStep >= 4 ? 'translateY(0)' : 'translateY(16px)',
                    }}
                >
                    <button
                        onClick={() => router.push('/onboarding')}
                        className="w-full h-14 rounded-xl bg-gradient-to-r from-[#C1502E] to-[#E07A5F] text-white font-semibold text-base hover:from-[#E07A5F] hover:to-[#C1502E] transition-all shadow-lg shadow-[#C1502E]/30 flex items-center justify-center gap-2 group"
                    >
                        Personalize My Experience
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-center text-xs text-white/30 mt-3">
                        Takes ~3 minutes · Sets up your AI for better results
                    </p>
                </div>
            </div>

            {/* Global confetti animation */}
            <style jsx global>{`
                @keyframes confettiFall {
                    0% { opacity: 1; transform: translateY(0) rotate(0deg); }
                    100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
                }
            `}</style>
        </div>
    );
}
