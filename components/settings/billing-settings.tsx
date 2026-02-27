'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Check, AlertTriangle, TrendingUp, X, History,
    CreditCard, Zap, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, useUser } from '@clerk/nextjs';
import { PLANS, type PlanId, type BillingInterval } from '@/lib/config/plans.config';
import { format } from 'date-fns';

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
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
    billingInterval?: string | null;
}

interface PaymentRecord {
    id: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    createdAt: string;
    description: string | null;
}

// ---------------------------------------------------------------------------
// UsageBar
// ---------------------------------------------------------------------------

function UsageBar({ label, current, limit, percentage }: {
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
// Cancellation confirm dialog
// ---------------------------------------------------------------------------

function CancelDialog({ onConfirm, onClose, periodEnd, isCancelling }: {
    onConfirm: (reason: string | null) => Promise<boolean>;
    onClose: () => void;
    periodEnd: string | null | undefined;
    isCancelling: boolean;
}) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [reason, setReason] = useState<string | null>(null);
    const router = useRouter();

    const REASONS = [
        "Too expensive",
        "Not using it enough",
        "Missing a feature I need",
        "Switching to another tool",
        "Other"
    ];

    const handleNext = () => {
        if (step === 1) setStep(2);
    };

    const handleFinalCancel = async () => {
        const success = await onConfirm(reason);
        if (success) {
            setStep(3);
        }
    };

    const formatted = periodEnd ? format(new Date(periodEnd), 'MMMM d, yyyy') : 'end of billing period';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl">
                {step === 1 && (
                    <>
                        <h3 className="text-lg font-bold mb-2">Cancel your subscription?</h3>
                        <p className="text-sm text-muted-foreground mb-5">
                            You'll lose access on <strong>{formatted}</strong>.<br />
                            Your posts and pillars will be paused.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
                            <Button variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={isCancelling}>Keep My Plan</Button>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto border-destructive text-destructive hover:bg-destructive hover:text-white"
                                onClick={handleNext}
                                disabled={isCancelling}
                            >
                                Continue Cancelling
                            </Button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h3 className="text-lg font-bold mb-2">We're sorry to see you go.</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            What's the main reason?
                        </p>
                        <div className="space-y-2 mb-6">
                            {REASONS.map(r => (
                                <button
                                    key={r}
                                    onClick={() => setReason(r)}
                                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${reason === r ? 'border-brand bg-brand/5 font-medium' : 'border-border hover:bg-muted'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${reason === r ? 'border-brand bg-brand text-transparent' : 'border-muted-foreground'
                                            }`}>
                                            {reason === r && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                        </div>
                                        <span className="text-sm">{r}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end items-center">
                            <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setStep(1)} disabled={isCancelling}>Back</Button>
                            <Button
                                className="bg-destructive hover:bg-destructive/90 text-white w-full sm:w-auto px-6"
                                onClick={handleFinalCancel}
                                disabled={!reason || isCancelling}
                            >
                                {isCancelling ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling...</> : 'Cancel My Subscription'}
                            </Button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <Check className="h-5 w-5 text-emerald-500" />
                            Subscription cancelled
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            You still have access until<br />
                            <strong>{formatted}</strong>.
                        </p>
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Changed your mind?</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    className="w-full flex-1"
                                    onClick={() => {
                                        onClose();
                                        router.push('/billing');
                                    }}
                                >
                                    Reactivate My Plan
                                </Button>
                                <Button variant="outline" className="w-full flex-1" onClick={() => {
                                    onClose();
                                    router.push('/dashboard');
                                }}>
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Post-payment success state
// ---------------------------------------------------------------------------

function PaymentSuccessBanner({ planName, onDismiss }: { planName: string; onDismiss: () => void }) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-[#1A1A1D] bg-[#1A1A1D] px-5 py-4 shadow-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-semibold text-white">
                        ✅ Payment successful! Activating {planName} plan…
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                        Your plan will be active within 30 seconds. Checking in background...
                    </p>
                </div>
            </div>
            <button onClick={onDismiss} className="shrink-0 text-gray-400 hover:text-white mt-1 transition-colors">
                <X className="h-5 w-5" />
            </button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Checkout loading overlay
// ---------------------------------------------------------------------------

function CheckoutLoading() {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-muted/60 backdrop-blur-sm py-8 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
            <span>Preparing your checkout…</span>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main BillingSettings
// ---------------------------------------------------------------------------

export function BillingSettings() {
    const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');
    const [isLoading, setIsLoading] = useState<string | null>(null);       // planId being loaded
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showSuccess, setShowSuccess] = useState<string | null>(null);   // plan name after payment
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [history, setHistory] = useState<PaymentRecord[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [summary, setSummary] = useState<UsageSummary | null>(null);

    const { getToken } = useAuth();
    const { user: clerkUser } = useUser();
    const searchParams = useSearchParams();
    const router = useRouter();
    const autoCheckoutTriggered = useRef(false);

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
        } catch { /* non-blocking */ }
    }, [getToken]);

    useEffect(() => { fetchUsageSummary(); }, [fetchUsageSummary]);

    // Auto-trigger checkout if arriving from /pricing with ?plan=...&billing=...
    useEffect(() => {
        if (autoCheckoutTriggered.current) return;
        const planParam = searchParams.get('plan') as PlanId | null;
        const billingParam = searchParams.get('billing') as BillingInterval | null;
        if (planParam && (planParam === 'starter' || planParam === 'growth')) {
            if (billingParam === 'monthly' || billingParam === 'yearly') {
                setBillingInterval(billingParam);
            }
            autoCheckoutTriggered.current = true;
            setCheckoutLoading(true);
            setTimeout(() => {
                setCheckoutLoading(false);
                handleSubscribe(planParam);
            }, 800);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const loadRazorpayScript = () => new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) { resolve(); return; }
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve();
        s.onerror = reject;
        document.body.appendChild(s);
    });

    const handleSubscribe = async (planId: PlanId) => {
        setIsLoading(planId);
        try {
            await loadRazorpayScript();

            const token = await getToken();
            const activePlanId = summary?.planId as PlanId | 'free_trial' | undefined;
            const hasActiveSub = summary?.status === 'active' || summary?.status === 'trialing';

            // Decide endpoint: upgrade if switching plans, create if new
            const endpoint = hasActiveSub && activePlanId && activePlanId !== 'free_trial' && activePlanId !== planId
                ? '/api/billing/upgrade-subscription'
                : '/api/billing/create-subscription';

            const response = await fetch(endpoint, {
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

            const options = {
                key: data.data.keyId,
                subscription_id: data.data.subscriptionId,
                name: 'ContentPilot AI',
                description: displayName,
                // Pre-fill with Clerk user data — reduces friction
                prefill: {
                    name: clerkUser?.fullName ?? '',
                    email: clerkUser?.primaryEmailAddress?.emailAddress ?? '',
                    contact: clerkUser?.primaryPhoneNumber?.phoneNumber ?? '',
                },
                notes: { planId, billingInterval },
                theme: { color: '#C1502E' },
                modal: {
                    ondismiss: () => {
                        toast('Checkout cancelled. Your plan was not changed.', { icon: 'ℹ️' });
                    },
                },
                handler: async () => {
                    setShowSuccess(planConfig.name);
                    // Poll until webhook confirms status change (max 30 seconds)
                    let attempts = 0;
                    const poll = setInterval(async () => {
                        try {
                            const token = await getToken();
                            const res = await fetch('/api/user/subscription', { headers: { Authorization: `Bearer ${token}` } });
                            if (res.ok) {
                                const json = await res.json();
                                setSummary(json.data ?? null);
                                if (json.data?.status === 'active') {
                                    clearInterval(poll);
                                }
                            }
                        } catch { /* ignore */ }
                        attempts++;
                        if (attempts >= 15) {
                            clearInterval(poll);
                        }
                    }, 2000);
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', (resp: any) => {
                toast.error(`Payment failed: ${resp.error.description}`);
            });
            rzp.open();

        } catch (error: any) {
            toast.error(error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(null);
        }
    };

    const handleCancel = async (reason: string | null): Promise<boolean> => {
        setIsCancelling(true);
        try {
            const token = await getToken();
            const res = await fetch('/api/billing/cancel-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ reason })
            });
            const data = await res.json();
            if (res.ok) {
                await fetchUsageSummary();
                return true;
            } else {
                toast.error(data.error?.message || 'Failed to cancel. Please contact support.');
                return false;
            }
        } catch {
            toast.error('Failed to cancel. Please try again.');
            return false;
        } finally {
            setIsCancelling(false);
        }
    };

    const fetchHistory = async () => {
        if (history.length > 0) { setShowHistory(v => !v); return; }
        setHistoryLoading(true);
        setShowHistory(true);
        try {
            const token = await getToken();
            const res = await fetch('/api/billing/history', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data.data?.payments ?? []);
            }
        } catch { /* non-blocking */ }
        finally { setHistoryLoading(false); }
    };

    const activePlanId = summary?.planId as PlanId | 'free_trial' | undefined;
    const subStatus = summary?.status ?? null;
    const hasActiveSub = subStatus === 'active' || subStatus === 'trialing';
    const isCancelledAtEnd = summary?.cancelAtPeriodEnd ?? false;

    const statusLabel: Record<string, { label: string; color: string }> = {
        active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
        trialing: { label: 'Free Trial', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
        past_due: { label: 'Past Due', color: 'bg-amber-100 text-amber-700' },
        halted: { label: 'Halted', color: 'bg-red-100 text-red-700' },
        canceled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600' },
        paused: { label: 'Paused', color: 'bg-gray-100 text-gray-600' },
    };

    return (
        <div className="space-y-6">
            {/* Cancel confirm dialog */}
            {showCancelDialog && (
                <CancelDialog
                    periodEnd={summary?.currentPeriodEnd}
                    onConfirm={handleCancel}
                    onClose={() => setShowCancelDialog(false)}
                    isCancelling={isCancelling}
                />
            )}

            {/* Trial banner */}
            {subStatus === 'trialing' && summary && (
                <TrialBanner trialEnd={(summary as any).trialEnd} />
            )}

            {/* Payment success banner */}
            {showSuccess && (
                <PaymentSuccessBanner
                    planName={showSuccess}
                    onDismiss={() => setShowSuccess(null)}
                />
            )}

            {/* Current plan status bar */}
            {summary && hasActiveSub && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                            <span className="font-semibold capitalize">{activePlanId !== 'free_trial' ? PLANS[activePlanId as PlanId]?.name : 'Free Trial'} Plan</span>
                            {summary.billingInterval && (
                                <span className="ml-1.5 text-muted-foreground">
                                    ({summary.billingInterval === 'yearly' ? 'Annual' : 'Monthly'})
                                </span>
                            )}
                        </div>
                        {subStatus && statusLabel[subStatus] && (
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusLabel[subStatus].color}`}>
                                {isCancelledAtEnd ? 'Cancels ' + format(new Date(summary.currentPeriodEnd!), 'MMM d') : statusLabel[subStatus].label}
                            </span>
                        )}
                    </div>
                    {/* Cancel / reactivate */}
                    {!isCancelledAtEnd && (
                        <button
                            onClick={() => setShowCancelDialog(true)}
                            disabled={isCancelling}
                            className="text-xs text-muted-foreground underline-offset-2 hover:underline hover:text-destructive transition-colors"
                        >
                            {isCancelling ? 'Cancelling…' : 'Cancel subscription'}
                        </button>
                    )}
                    {isCancelledAtEnd && summary.currentPeriodEnd && (
                        <span className="text-xs text-muted-foreground">
                            Access until {format(new Date(summary.currentPeriodEnd), 'MMM d, yyyy')}
                        </span>
                    )}
                </div>
            )}

            {/* Billing interval toggle */}
            <div className="flex items-center justify-center gap-3">
                <span className={`text-sm font-medium ${billingInterval === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Monthly
                </span>
                <button
                    role="switch"
                    aria-checked={billingInterval === 'yearly'}
                    aria-label="Toggle billing interval"
                    onClick={() => setBillingInterval(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2
                        ${billingInterval === 'yearly' ? 'bg-brand' : 'bg-muted'}`}
                >
                    <span className={`inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform
                        ${billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`text-sm font-medium ${billingInterval === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Yearly
                    <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Save 20%
                    </span>
                </span>
            </div>

            {/* Checkout loading */}
            {checkoutLoading && <CheckoutLoading />}

            {/* Plan cards */}
            {!checkoutLoading && (!hasActiveSub || subStatus === 'trialing') && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {(Object.values(PLANS) as typeof PLANS[PlanId][]).map((plan) => {
                        const isActive = activePlanId === plan.id && hasActiveSub;
                        const isDowngrade = hasActiveSub && activePlanId === 'growth' && plan.id === 'starter';
                        const price = billingInterval === 'yearly' ? plan.yearlyMonthlyEquivalent : plan.monthlyPriceUsd;
                        const originalPrice = plan.monthlyPriceUsd;
                        // INR equivalent shown for transparency
                        const inrMonthly = plan.id === 'starter' ? 1728 : 4456;
                        const inrYearly = plan.id === 'starter' ? 16368 : 42556;
                        const inrDisplay = billingInterval === 'yearly' ? inrYearly : inrMonthly;

                        let ctaLabel = 'Start 7-Day Trial';
                        if (isActive) ctaLabel = 'Current Plan';
                        else if (isDowngrade) ctaLabel = 'Downgrade';
                        else if (hasActiveSub) ctaLabel = 'Upgrade';
                        else if (isLoading === plan.id) ctaLabel = 'Opening checkout…';

                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col rounded-2xl border p-6 transition-shadow
                                    ${isActive ? 'border-brand shadow-[0_0_0_2px] shadow-brand/20' : 'border-border hover:shadow-md'}`}
                            >
                                {/* Badges */}
                                <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 gap-2">
                                    {isActive && (
                                        <Badge className="bg-brand text-white">Current Plan</Badge>
                                    )}
                                    {plan.badge && !isActive && (
                                        <Badge variant="outline" className="border-brand text-brand bg-background">
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
                                <div className="mb-1 flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">${price}</span>
                                    <span className="text-sm text-muted-foreground">/mo</span>
                                    {billingInterval === 'yearly' && price < originalPrice && (
                                        <span className="ml-2 text-sm text-muted-foreground line-through">${originalPrice}</span>
                                    )}
                                </div>
                                {/* INR transparency */}
                                <p className="mb-4 text-xs text-muted-foreground">
                                    Billed as <strong>₹{inrDisplay.toLocaleString('en-IN')}</strong>
                                    {billingInterval === 'yearly' ? '/year' : '/month'} in INR
                                </p>

                                {/* Features */}
                                <ul className="mb-6 flex-1 space-y-2.5">
                                    {[
                                        `${plan.limits.postsPerMonth ?? '∞'} posts / month`,
                                        `${plan.limits.pillars ?? '∞'} content pillars`,
                                        `${plan.limits.voiceExamples ?? '∞'} voice examples`,
                                        plan.limits.regenerationsPerMonth === null
                                            ? 'Unlimited regenerations'
                                            : `${plan.limits.regenerationsPerMonth} regenerations / month`,
                                        plan.features.prioritySupport ? 'Priority email support' : 'Email support',
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
                                    disabled={isActive || isCancelledAtEnd || isLoading !== null}
                                    onClick={() => handleSubscribe(plan.id)}
                                >
                                    {isLoading === plan.id
                                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening checkout…</>
                                        : ctaLabel}
                                </Button>
                                {!hasActiveSub && (
                                    <p className="mt-2 text-center text-xs text-muted-foreground">
                                        7-day free trial · No credit card charged upfront
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

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

            {/* Billing history */}
            <Card>
                <CardHeader
                    className="cursor-pointer select-none"
                    onClick={fetchHistory}
                >
                    <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Payment History
                        </span>
                        {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CardTitle>
                </CardHeader>
                {showHistory && (
                    <CardContent>
                        {historyLoading ? (
                            <div className="flex justify-center py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-sm text-muted-foreground">Payment history will appear here after your first billing cycle.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {history.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between py-3 text-sm">
                                        <div>
                                            <p className="font-medium">
                                                {p.currency} {p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(p.createdAt), 'MMM d, yyyy')} · via {p.method}
                                            </p>
                                        </div>
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold
                                            ${p.status === 'captured' ? 'bg-emerald-100 text-emerald-700' :
                                                p.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-600'}`}>
                                            {p.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
