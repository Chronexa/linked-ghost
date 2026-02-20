'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';

const TIER_FEATURES = {
    starter: ['20 Auto-generated Posts/mo', '50 AI Researches', 'Basic Persona Voice', 'Email Support'],
    growth: ['100 Auto-generated Posts/mo', '200 AI Researches', 'Advanced Voice Analytics', 'Priority Support'],
    agency: ['500 Auto-generated Posts/mo', '1000 AI Researches', 'Multiple Personas', '24/7 Phone Support'],
};

export function BillingSettings() {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const { getToken } = useAuth();

    // We would dynamically fetch the user's active plan here. 
    // For now, let's assume they are on 'free_trial' or no active subscription.
    const activePlan: string = 'free_trial';

    const handleSubscribe = async (planType: 'starter' | 'growth' | 'agency') => {
        setIsLoading(planType);

        try {
            // Include Razorpay Checkout script if not present
            if (!(window as any).Razorpay) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }

            const token = await getToken();
            const response = await fetch('/api/billing/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ planType })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to initialize checkout');
            }

            const data = await response.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Ensure we inject this!
                subscription_id: data.subscriptionId,
                name: "ContentPilot AI",
                description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan Subscription`,
                image: "/logo.png", // Replace with actual logo path
                handler: function (response: any) {
                    toast.success('Subscription activated successfully! Refreshing...');
                    setTimeout(() => window.location.reload(), 2000);
                },
                theme: {
                    color: "#0f172a" // Slate-900 (adjust to match your brand)
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                console.error("Payment Failed", response.error);
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
            <Card>
                <CardHeader>
                    <CardTitle>Subscription & Billing</CardTitle>
                    <CardDescription>Manage your plan and usage limits</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        {/* Starter Plan */}
                        <div className={`relative flex flex-col p-6 rounded-2xl border ${activePlan === 'starter' ? 'border-brand shadow-sm' : 'border-border'}`}>
                            {activePlan === 'starter' && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Current Plan</Badge>
                            )}
                            <div className="mb-4">
                                <h3 className="text-xl font-bold">Starter</h3>
                                <p className="text-muted-foreground text-sm mt-1">Perfect for individuals getting started</p>
                            </div>
                            <div className="mb-6 flex items-baseline text-3xl font-bold">
                                $29<span className="text-muted-foreground text-sm font-normal ml-1">/mo</span>
                            </div>
                            <ul className="flex-1 space-y-3 mb-6">
                                {TIER_FEATURES.starter.map((feat, i) => (
                                    <li key={i} className="flex gap-3 text-sm">
                                        <Check className="h-4 w-4 text-brand shrink-0" /> {feat}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                className="w-full mt-auto"
                                variant={activePlan === 'starter' ? 'outline' : 'primary'}
                                disabled={activePlan === 'starter' || isLoading !== null}
                                onClick={() => handleSubscribe('starter')}
                            >
                                {isLoading === 'starter' ? 'Initializing...' : activePlan === 'starter' ? 'Active' : 'Subscribe'}
                            </Button>
                        </div>

                        {/* Growth Plan */}
                        <div className={`relative flex flex-col p-6 rounded-2xl border ${activePlan === 'growth' ? 'border-brand shadow-sm' : 'border-border'}`}>
                            {activePlan === 'growth' && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Current Plan</Badge>
                            )}
                            <div className="mb-4">
                                <h3 className="text-xl font-bold">Growth</h3>
                                <p className="text-muted-foreground text-sm mt-1">For creators scaling their audience</p>
                            </div>
                            <div className="mb-6 flex items-baseline text-3xl font-bold">
                                $79<span className="text-muted-foreground text-sm font-normal ml-1">/mo</span>
                            </div>
                            <ul className="flex-1 space-y-3 mb-6">
                                {TIER_FEATURES.growth.map((feat, i) => (
                                    <li key={i} className="flex gap-3 text-sm">
                                        <Check className="h-4 w-4 text-brand shrink-0" /> {feat}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                className="w-full mt-auto"
                                variant={activePlan === 'growth' ? 'outline' : 'primary'}
                                disabled={activePlan === 'growth' || isLoading !== null}
                                onClick={() => handleSubscribe('growth')}
                            >
                                {isLoading === 'growth' ? 'Initializing...' : activePlan === 'growth' ? 'Active' : 'Subscribe'}
                            </Button>
                        </div>

                        {/* Agency Plan */}
                        <div className={`relative flex flex-col p-6 rounded-2xl border ${activePlan === 'agency' ? 'border-brand shadow-sm' : 'border-border'}`}>
                            {activePlan === 'agency' && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Current Plan</Badge>
                            )}
                            <div className="mb-4">
                                <h3 className="text-xl font-bold">Agency</h3>
                                <p className="text-muted-foreground text-sm mt-1">Full power for marketing teams</p>
                            </div>
                            <div className="mb-6 flex items-baseline text-3xl font-bold">
                                $199<span className="text-muted-foreground text-sm font-normal ml-1">/mo</span>
                            </div>
                            <ul className="flex-1 space-y-3 mb-6">
                                {TIER_FEATURES.agency.map((feat, i) => (
                                    <li key={i} className="flex gap-3 text-sm">
                                        <Check className="h-4 w-4 text-brand shrink-0" /> {feat}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                className="w-full mt-auto"
                                variant={activePlan === 'agency' ? 'outline' : 'primary'}
                                disabled={activePlan === 'agency' || isLoading !== null}
                                onClick={() => handleSubscribe('agency')}
                            >
                                {isLoading === 'agency' ? 'Initializing...' : activePlan === 'agency' ? 'Active' : 'Subscribe'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
