import Link from 'next/link';
import { Button } from '@/components/ui';
import { Lock, XCircle, Zap } from 'lucide-react';

export function FinalCtaSection() {
    return (
        <section className="w-full bg-[#0F0F12] py-32 border-t border-gray-800" aria-label="Final Call to Action">
            <div className="container mx-auto px-6 max-w-[1100px] text-center">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    Your next LinkedIn post is 3 minutes away.
                </h2>
                <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto">
                    Join 50+ professionals who've replaced the blank page with ContentPilot AI.
                </p>
                <div className="flex justify-center mb-10">
                    <Link href="/sign-up">
                        <Button size="lg" className="bg-brand text-white hover:bg-brand/90 px-10 py-7 text-lg rounded-xl shadow-[0_0_30px_rgba(193,80,46,0.2)] hover:shadow-[0_0_40px_rgba(193,80,46,0.3)] transition-all hover:scale-105">
                            Start your 7-day free trial &rarr;
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm text-gray-500">
                    <span className="flex items-center gap-2"><Lock className="w-4 h-4" aria-hidden="true" /> No credit card required</span>
                    <span className="flex items-center gap-2"><XCircle className="w-4 h-4" aria-hidden="true" /> Cancel any time, instantly</span>
                    <span className="flex items-center gap-2"><Zap className="w-4 h-4" aria-hidden="true" /> Set up in under 5 minutes</span>
                </div>
            </div>
        </section>
    );
}
