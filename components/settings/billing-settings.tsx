'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, AlertTriangle, TrendingUp, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';
import { PLANS, type PlanId, type BillingInterval } from '@/lib/config/plans.config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UsageSummary {
    planId: string;
    status: string | null;
    limits: {
        postsPerMonth: number | null;
        pillars: number | null;
        voiceExamples: number | null;
        regenerationsPerMonth: number | null;
    };
    usage: {
        postsThisMonth: number;
        regenerationsThisMonth: number;
        pillarsCount: number;
        voiceExamplesCount: number;
    };
    percentages: {
        posts: number;
        regenerations: number;
        pillars: number;
        voiceExamples: number;
    };
    trialEnd?: string | null;
}

// ---------------------------------------------------------------------------
// Usage Bar component
// ---------------------------------------------------------------------------

function UsageBar({
    label,
    current,
    limit,
    percentage,
}: {
    label: string;
    current: number;
    limit: number | null;
    percentage: number;
}) {
    const color =
        percentage >= 90 ? 'bg-red-500' :
            percentage >= 70 ? 'bg-amber-500' :
                'bg-emerald-500';

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium tabular-nums">
                    {current} / {limit === null ? '∞' : limit}
                </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Trial Banner
// ---------------------------------------------------------------------------

function TrialBanner({ trialEnd }: { trialEnd: string | null | undefined }) {
    const [dismissed, setDismissed] = useState(false);

    if (!trialEnd || dismissed) return null;

    const daysLeft = Math.max(0, Math.ceil(
        (new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ));

    if (daysLeft <= 0) return null;

    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                    Your free trial ends in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>.
                    Subscribe to keep your access.
                </span>
            </div>
            <button onClick={() => setDismissed(true)} className="shrink-0 opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main BillingSettings
// ---------------------------------------------------------------------------

export function BillingSettings() {
    const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [summary, setSummary] = useState<UsageSummary | null>(null);
    const { getToken } = useAuth();

    const fetchUsageSummary = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch('/api/user/subscription', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                setSummary(json.data ?? null);
            }
        } catch {
            // Non-blocking — page still works without this
        }
    }, [getToken]);

    useEffect(() => { fetchUsageSummary(); }, [fetchUsageSummary]);

    const activePlanId = summary?.planId as PlanId | 'free_trial' | undefined;
    const subStatus = summary?.status;

    const handleSubscribe = async (planId: PlanId) => {
        setIsLoading(planId);
        try {
            // Dynamically load Razorpay checkout script
            if (!(window as any).Razorpay) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = () => resolve();
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }

            const token = await getToken();
            const response = await fetch('/api/billing/create-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ planId, billingInterval }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    toast.error(data.data?.error || 'You already have an active subscription.');
                } else {
                    toast.error(data.error?.message || 'Failed to initialize checkout. Please try again.');
                }
                return;
            }

            const planConfig = PLANS[planId];
            const displayName = `${planConfig.name} — ${billingInterval === 'yearly' ? 'Annual' : 'Monthly'}`;
            const priceUsd = billingInterval === 'yearly' ? planConfig.yearlyPriceUsd : planConfig.monthlyPriceUsd;

            const options = {
                key: data.data.keyId,
                subscription_id: data.data.subscriptionId,
                name: 'ContentPilot AI',
                description: displayName,
                prefill: {}, // Clerk handles user identity
                notes: { planId, billingInterval },
                theme: { color: '#C1502E' }, // Brand color
                handler: async function () {
                    toast.success('Payment successful! Your plan is activating...');
                    // Poll subscription status until active
                    let attempts = 0;
                    const poll = setInterval(async () => {
                        await fetchUsageSummary();
                        attempts++;
                        if (attempts >= 10) {
                            clearInterval(poll);
                            toast('Plan activation may take a moment. Refresh if needed.', { icon: 'ℹ️' });
                        }
                    }, 2000);
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                console.error('Payment Failed', response.error);
                toast.error(`Payment failed: ${response.error.description}`);
            });
            rzp.open();

        } catch (error: any) {
            toast.error(error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Trial banner */}
            {subStatus === 'trialing' && summary && (
                <TrialBanner trialEnd={(summary as any).trialEnd} />
            )}

            {/* Billing interval toggle */}
            <div className="flex items-center justify-center gap-3">
                <span className={`text-sm font-medium ${billingInterval === 'monthly' ? '' : 'text-muted-foreground'}`}>
                    Monthly
                </span>
                <button
                    onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none
                        ${billingInterval === 'yearly' ? 'bg-brand' : 'bg-muted'}`}
                    aria-label="Toggle billing interval"
                >
                    <span className={`inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform
                        ${billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`text-sm font-medium ${billingInterval === 'yearly' ? '' : 'text-muted-foreground'}`}>
                    Yearly
                    <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Save 20%
                    </span>
                </span>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {(Object.values(PLANS) as typeof PLANS[PlanId][]).map((plan) => {
                    const isActive = activePlanId === plan.id;
                    const price = billingInterval === 'yearly'
                        ? plan.yearlyMonthlyEquivalent
                        : plan.monthlyPriceUsd;
                    const originalPrice = plan.monthlyPriceUsd;

                    return (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-2xl border p-6 transition-shadow
                                ${isActive ? 'border-brand shadow-md' : 'border-border'}`}
                        >
                            {/* Badges */}
                            <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 gap-2">
                                {isActive && (
                                    <Badge className="bg-brand text-white">Current Plan</Badge>
                                )}
                                {plan.badge && !isActive && (
                                    <Badge variant="outline" className="border-brand text-brand">
                                        {plan.badge}
                                    </Badge>
                                )}
                            </div>

                            {/* Plan name */}
                            <div className="mb-4">
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-6 flex items-baseline gap-1">
                                <span className="text-4xl font-bold">${price}</span>
                                <span className="text-sm text-muted-foreground">/mo</span>
                                {billingInterval === 'yearly' && price < originalPrice && (
                                    <span className="ml-2 text-sm text-muted-foreground line-through">
                                        ${originalPrice}
                                    </span>
                                )}
                            </div>

                            {billingInterval === 'yearly' && (
                                <p className="mb-4 -mt-3 text-xs text-muted-foreground">
                                    Billed ${plan.yearlyPriceUsd}/year
                                </p>
                            )}

                            {/* Feature list */}
                            <ul className="mb-6 flex-1 space-y-2.5">
                                {[
                                    `${plan.limits.postsPerMonth ?? '∞'} posts / month`,
                                    `${plan.limits.pillars ?? '∞'} content pillars`,
                                    `${plan.limits.voiceExamples ?? '∞'} voice examples`,
                                    plan.limits.regenerationsPerMonth === null
                                        ? 'Unlimited regenerations'
                                        : `${plan.limits.regenerationsPerMonth} regenerations / month`,
                                    plan.features.prioritySupport ? 'Priority support' : 'Email support',
                                ].map((feat, i) => (
                                    <li key={i} className="flex items-center gap-2.5 text-sm">
                                        <Check className="h-4 w-4 shrink-0 text-brand" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <Button
                                className="mt-auto w-full"
                                variant={isActive ? 'outline' : 'primary'}
                                disabled={isActive || isLoading !== null}
                                onClick={() => handleSubscribe(plan.id)}
                            >
                                {isLoading === plan.id
                                    ? 'Opening checkout...'
                                    : isActive
                                        ? 'Active'
                                        : `Subscribe — $${price}/mo`}
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* Usage section */}
            {summary && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-4 w-4" />
                            Your Usage This Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <UsageBar
                            label="Posts Generated"
                            current={summary.usage.postsThisMonth}
                            limit={summary.limits.postsPerMonth}
                            percentage={summary.percentages.posts}
                        />
                        <UsageBar
                            label="Regenerations"
                            current={summary.usage.regenerationsThisMonth}
                            limit={summary.limits.regenerationsPerMonth}
                            percentage={summary.percentages.regenerations}
                        />
                        <UsageBar
                            label="Content Pillars"
                            current={summary.usage.pillarsCount}
                            limit={summary.limits.pillars}
                            percentage={summary.percentages.pillars}
                        />
                        <UsageBar
                            label="Voice Examples"
                            current={summary.usage.voiceExamplesCount}
                            limit={summary.limits.voiceExamples}
                            percentage={summary.percentages.voiceExamples}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
