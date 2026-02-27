import Link from 'next/link';
import { Button } from '@/components/ui';
import { Check } from 'lucide-react';

export function PricingSection() {
    return (
        <section className="w-full bg-[#FAFAF7] py-32 border-t border-gray-100 overflow-hidden" aria-label="Pricing">
            <div className="max-w-[1100px] mx-auto px-6 text-center">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                    Simple, transparent pricing.
                </h2>
                <p className="text-xl text-gray-500 mb-16">
                    Start free for 7 days. No credit card required.
                </p>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
                    {/* Starter Plan */}
                    <div className="bg-white border border-gray-200 rounded-[16px] p-10 text-left hover:border-gray-300 transition-colors flex flex-col shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
                        <div className="text-4xl font-display font-bold text-gray-900 mb-4">$19<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                        <p className="text-gray-500 mb-8 h-12">For creators building their presence</p>

                        <ul className="space-y-4 mb-10 flex-1">
                            {["15 posts per month", "2 content pillars", "10 voice examples", "Daily topic discovery", "Email support"].map((ft, i) => (
                                <li key={i} className="flex items-center text-gray-600">
                                    <Check className="text-brand w-5 h-5 mr-3 shrink-0" aria-hidden="true" /> {ft}
                                </li>
                            ))}
                        </ul>
                        <Link href="/sign-up" aria-label="Start Free Trial for Starter Plan">
                            <Button variant="outline" className="w-full text-gray-700 border-gray-200 hover:bg-gray-50 py-6 text-base h-14">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>

                    {/* Growth Plan */}
                    <div className="bg-[#f8faff] border-2 border-brand rounded-[16px] p-10 text-left relative shadow-lg flex flex-col transform md:scale-105 z-10">
                        <div className="absolute top-0 right-8 -translate-y-1/2 bg-brand text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                            MOST POPULAR
                        </div>
                        <h3 className="text-xl font-semibold text-brand mb-2">Growth</h3>
                        <div className="text-4xl font-display font-bold text-gray-900 mb-4">$49<span className="text-lg text-gray-500 font-normal">/mo</span></div>
                        <p className="text-gray-500 mb-8 h-12">For active thought leaders</p>

                        <ul className="space-y-4 mb-10 flex-1">
                            {["60 posts per month", "5 content pillars", "25 voice examples", "Unlimited regenerations", "Advanced voice matching"].map((ft, i) => (
                                <li key={i} className="flex items-center text-gray-900">
                                    <Check className="text-brand w-5 h-5 mr-3 shrink-0" aria-hidden="true" /> {ft}
                                </li>
                            ))}
                        </ul>
                        <Link href="/sign-up" aria-label="Start Free Trial for Growth Plan">
                            <Button className="w-full bg-brand text-white hover:bg-brand/90 py-6 text-base h-14 shadow-md hover:shadow-lg transition-shadow">
                                Start Free Trial &rarr;
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
