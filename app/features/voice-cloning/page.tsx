import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { FinalCtaSection } from '@/components/landing/final-cta-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { Mic, Check, Fingerprint, RefreshCw, Brain } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export const metadata = {
    title: 'AI Voice Cloning for LinkedIn | ContentPilot AI',
    description: 'ContentPilot learns your tone, vocabulary, and sentence structure to generate LinkedIn posts that sound exactly like you — not like a chatbot.',
};

export default function VoiceCloningPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />
            <main>
                {/* Hero */}
                <section className="container mx-auto px-6 pt-32 pb-24 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-brand px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-8 border border-blue-100">
                        <Mic className="w-4 h-4" aria-hidden="true" /> VOICE CLONING
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl font-bold mb-8 leading-[1.1] tracking-tight text-gray-900">
                        AI that writes exactly<br />how <em className="not-italic text-brand">you</em> write.
                    </h1>
                    <p className="text-xl text-gray-500 mb-12 leading-relaxed max-w-2xl mx-auto">
                        Stop sounding like every other AI-generated LinkedIn post. ContentPilot analyzes your past posts to learn your unique voice — then generates new content you&apos;d actually be proud to publish.
                    </p>
                    <Link href="/sign-up">
                        <Button size="lg" className="px-10 text-lg bg-brand text-white hover:bg-brand/90 h-14 shadow-lg hover:scale-105 transition-all">
                            Try Voice Cloning Free
                        </Button>
                    </Link>
                </section>

                {/* How It Works */}
                <section className="w-full bg-[#FAFAF7] py-24 border-y border-gray-100">
                    <div className="container mx-auto px-6 max-w-[1100px]">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-16 text-center tracking-tight">How voice cloning works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: Brain, step: '01', title: 'Analyze Your Style', desc: 'Paste 5–25 of your existing LinkedIn posts. ContentPilot breaks down your sentence structure, vocabulary, recurring phrases, and tone profile.' },
                                { icon: Fingerprint, step: '02', title: 'Build Your Voice Print', desc: 'We create a unique voice fingerprint: how casual vs. formal you are, how long your sentences run, how often you use lists vs. stories.' },
                                { icon: RefreshCw, step: '03', title: 'Generate & Refine', desc: 'Every post generated uses your voice print. Run regenerations until it sounds exactly right — your match score updates in real time.' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                                    <div className="text-xs font-bold text-gray-400 tracking-widest mb-4">{item.step}</div>
                                    <item.icon className="w-6 h-6 text-brand mb-4" strokeWidth={1.5} aria-hidden="true" />
                                    <h3 className="font-semibold text-lg text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits */}
                <section className="container mx-auto px-6 py-24 max-w-[1100px]">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center tracking-tight">What you get</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
                        {[
                            '94% average voice match score',
                            'No generic AI filler phrases',
                            'Trained on your specific content pillars',
                            'Improves over time as you give feedback',
                            'Works in any language or writing register',
                            'Your audience will never know it\'s AI-assisted',
                        ].map((benefit, i) => (
                            <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                <Check className="w-5 h-5 text-brand shrink-0" aria-hidden="true" /> {benefit}
                            </li>
                        ))}
                    </ul>
                </section>

                <PricingSection />
                <FinalCtaSection />
            </main>
            <Footer />
        </div>
    );
}
