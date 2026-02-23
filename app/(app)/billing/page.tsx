'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { PLANS, type PlanId, type BillingInterval } from '@/lib/config/plans.config';
import { Loader2, Lock, Check, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * Dedicated Checkout Page — /billing
 *
 * First-time subscribers land here (not the settings tab).
 * Shows plan summary, change-plan dropdown, and "Continue to Payment" CTA.
 * On success → redirects to /subscription/success.
 */
export default function BillingCheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { getToken } = useAuth();
    const { user: clerkUser } = useUser();

    // Read plan from URL or cookie
    const [planId, setPlanId] = useState<PlanId>('growth');
    const [billing, setBilling] = useState<BillingInterval>('monthly');
    const [isLoading, setIsLoading] = useState(false);
    const [showPlanPicker, setShowPlanPicker] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        // URL params take priority
        const pParam = searchParams.get('plan') as PlanId | null;
        const bParam = searchParams.get('billing') as BillingInterval | null;

        if (pParam && (pParam === 'starter' || pParam === 'growth')) {
            setPlanId(pParam);
        }
        if (bParam && (bParam === 'monthly' || bParam === 'yearly')) {
            setBilling(bParam);
        }

        // Fallback to cookie
        if (!pParam) {
            const cookies = document.cookie.split(';').reduce<Record<string, string>>((acc, c) => {
                const [k, v] = c.trim().split('=');
                if (k && v) acc[k] = v;
                return acc;
            }, {});
            const raw = cookies['cp_selected_plan'];
            if (raw) {
                const [pId, bInt] = raw.split(':');
                if (pId === 'starter' || pId === 'growth') setPlanId(pId as PlanId);
                if (bInt === 'monthly' || bInt === 'yearly') setBilling(bInt as BillingInterval);
            }
        }
    }, [searchParams]);

    const plan = PLANS[planId];
    const price = billing === 'yearly' ? plan.yearlyMonthlyEquivalent : plan.monthlyPriceUsd;
    const totalLabel = billing === 'yearly' ? `$${plan.yearlyPriceUsd}/year` : `$${price}/month`;

    // INR amounts for transparency
    const inrMonthly = planId === 'starter' ? 1728 : 4456;
    const inrYearly = planId === 'starter' ? 16368 : 42556;
    const inrAmount = billing === 'yearly' ? inrYearly : inrMonthly;

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            // Load Razorpay script
            if (!(window as any).Razorpay) {
                await new Promise<void>((resolve, reject) => {
                    const s = document.createElement('script');
                    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    s.onload = () => resolve();
                    s.onerror = reject;
                    document.body.appendChild(s);
                });
            }

            const token = await getToken();
            const res = await fetch('/api/billing/create-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ planId, billingInterval: billing }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data.data?.error || data.error?.message || 'Failed to create checkout.');
                return;
            }

            const displayName = `${plan.name} — ${billing === 'yearly' ? 'Annual' : 'Monthly'}`;

            const options = {
                key: data.data.keyId,
                subscription_id: data.data.subscriptionId,
                name: 'ContentPilot AI',
                description: displayName,
                prefill: {
                    name: clerkUser?.fullName ?? '',
                    email: clerkUser?.primaryEmailAddress?.emailAddress ?? '',
                    contact: clerkUser?.primaryPhoneNumber?.phoneNumber ?? '',
                },
                notes: { planId, billingInterval: billing },
                theme: { color: '#C1502E' },
                modal: {
                    ondismiss: () => {
                        toast('Checkout cancelled. No charges were made.', { icon: 'ℹ️' });
                    },
                },
                handler: async () => {
                    // Payment success → go to success page
                    router.push(`/subscription/success?plan=${planId}&billing=${billing}`);
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', (resp: any) => {
                toast.error(`Payment failed: ${resp.error.description}`);
            });
            rzp.open();

        } catch (err: any) {
            toast.error(err.message || 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFCF2] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold text-[#1A1A1D] text-center mb-8">
                    Complete your subscription
                </h1>

                <div className="rounded-2xl bg-white border border-[#E8E2D8] p-8 shadow-sm">
                    {/* Plan summary */}
                    <div className="mb-6">
                        <p className="text-xs uppercase tracking-wide text-[#9CA3AF] mb-1">Plan</p>
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-[#1A1A1D]">{plan.name}</span>
                            <span className="text-lg font-bold text-[#C1502E]">${price}<span className="text-sm font-normal text-[#52525B]">/mo</span></span>
                        </div>
                        <p className="text-sm text-[#52525B] mt-0.5">
                            Billed {totalLabel} · ₹{inrAmount.toLocaleString('en-IN')} in INR
                        </p>
                    </div>

                    {/* Change plan picker */}
                    <button
                        onClick={() => setShowPlanPicker(!showPlanPicker)}
                        className="flex items-center gap-1 text-sm text-[#C1502E] hover:text-[#E07A5F] transition-colors mb-4"
                    >
                        Change plan <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showPlanPicker ? 'rotate-180' : ''}`} />
                    </button>

                    {showPlanPicker && (
                        <div className="rounded-lg border border-[#E8E2D8] p-4 mb-6 space-y-3 bg-[#FAFAF5]">
                            {/* Plan options */}
                            {(['starter', 'growth'] as PlanId[]).map((pId) => (
                                <label
                                    key={pId}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                                        ${planId === pId ? 'bg-[#C1502E]/5 border border-[#C1502E]/30' : 'hover:bg-[#F5F0E8]'}`}
                                >
                                    <input
                                        type="radio"
                                        name="plan"
                                        checked={planId === pId}
                                        onChange={() => setPlanId(pId)}
                                        className="accent-[#C1502E]"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-[#1A1A1D]">{PLANS[pId].name}</p>
                                        <p className="text-xs text-[#52525B]">{PLANS[pId].description}</p>
                                    </div>
                                </label>
                            ))}

                            {/* Billing toggle */}
                            <div className="flex items-center gap-3 pt-2 border-t border-[#E8E2D8]">
                                {(['monthly', 'yearly'] as BillingInterval[]).map((b) => (
                                    <button
                                        key={b}
                                        onClick={() => setBilling(b)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                                            ${billing === b
                                                ? 'bg-[#1A1A1D] text-white'
                                                : 'bg-[#F5F0E8] text-[#52525B] hover:bg-[#E8E2D8]'
                                            }`}
                                    >
                                        {b === 'monthly' ? 'Monthly' : 'Yearly (Save 20%)'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Features preview */}
                    <div className="mb-6 space-y-2">
                        {[
                            `${plan.limits.postsPerMonth} posts/month`,
                            `${plan.limits.pillars} content pillars`,
                            plan.features.prioritySupport ? 'Priority support' : 'Email support',
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-[#374151]">
                                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                {f}
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-[#C1502E] text-white font-semibold text-sm hover:bg-[#E07A5F] transition-all shadow-md disabled:opacity-60"
                    >
                        {isLoading
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Preparing secure checkout…</>
                            : 'Continue to Payment →'
                        }
                    </button>

                    {/* Trust footer */}
                    <div className="mt-4 flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                            <Lock className="h-3 w-3" />
                            Secure checkout via Razorpay
                        </div>
                        <p className="text-xs text-[#9CA3AF]">✓ Cancel anytime from your account</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
