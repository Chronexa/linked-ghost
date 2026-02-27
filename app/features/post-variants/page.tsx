import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { FinalCtaSection } from '@/components/landing/final-cta-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { Layers, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export const metadata = {
    title: 'AI Post Variants for LinkedIn | ContentPilot AI',
    description: 'Get 3 distinct post angles on every topic — story, insight, and list — so you always have options that feel right for the day.',
};

export default function PostVariantsPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />
            <main>
                {/* Hero */}
                <section className="container mx-auto px-6 pt-32 pb-24 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-brand px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-8 border border-blue-100">
                        <Layers className="w-4 h-4" aria-hidden="true" /> POST VARIANTS
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl font-bold mb-8 leading-[1.1] tracking-tight text-gray-900">
                        3 different angles.<br />One perfect post.
                    </h1>
                    <p className="text-xl text-gray-500 mb-12 leading-relaxed max-w-2xl mx-auto">
                        On any given topic, the right format depends on your mood, your audience, and the week. ContentPilot gives you 3 ready-to-publish variants — a story, an insight, and a list — so you always have options.
                    </p>
                    <Link href="/sign-up">
                        <Button size="lg" className="px-10 text-lg bg-brand text-white hover:bg-brand/90 h-14 shadow-lg hover:scale-105 transition-all">
                            Try Post Variants Free
                        </Button>
                    </Link>
                </section>

                {/* The 3 formats */}
                <section className="w-full bg-[#FAFAF7] py-24 border-y border-gray-100">
                    <div className="container mx-auto px-6 max-w-[1100px]">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-16 text-center tracking-tight">The 3 standard variants</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'Variant A', title: 'The Story', desc: 'A narrative hook that draws the reader in through a first-person experience, leading to a key insight. Great for building emotional connection.', example: 'I almost quit in year two. Here\'s what kept me going...' },
                                { label: 'Variant B', title: 'The Insight', desc: 'A concise, confident take on a trend or idea in your niche. Great for establishing expertise and provoking thought.', example: 'Most founders mistake activity for progress. There\'s a difference...' },
                                { label: 'Variant C', title: 'The List', desc: 'A practical, scannable breakdown. Great for maximizing saves, shares, and reach on the algorithm.', example: '7 things I wish I knew before raising a seed round:...' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                                    <div className="text-xs font-bold text-brand tracking-widest mb-3 uppercase">{item.label}</div>
                                    <h3 className="font-semibold text-xl text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm mb-5">{item.desc}</p>
                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 font-mono text-sm text-gray-600 italic">
                                        &ldquo;{item.example}&rdquo;
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits */}
                <section className="container mx-auto px-6 py-24 max-w-[1100px]">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center tracking-tight">More choice, less friction</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
                        {[
                            'Pick your favorite and publish in one click',
                            'All variants match your trained voice perfectly',
                            'Regenerate any single variant independently',
                            'Edit inline before publishing',
                            'All variants auto-tagged to your content pillars',
                            'Track which format performs best over time',
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                <Check className="w-5 h-5 text-brand shrink-0" aria-hidden="true" /> {item}
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
