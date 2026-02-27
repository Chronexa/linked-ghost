import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { FinalCtaSection } from '@/components/landing/final-cta-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { Search, Rss, BarChart2, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export const metadata = {
    title: 'AI Topic Discovery for LinkedIn | ContentPilot AI',
    description: 'Never run out of ideas. ContentPilot scans news, Reddit, and industry sources daily to find trending content your audience cares about.',
};

export default function TopicDiscoveryPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />
            <main>
                {/* Hero */}
                <section className="container mx-auto px-6 pt-32 pb-24 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-brand px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-8 border border-blue-100">
                        <Search className="w-4 h-4" aria-hidden="true" /> TOPIC DISCOVERY
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl font-bold mb-8 leading-[1.1] tracking-tight text-gray-900">
                        Never stare at a<br />blank page again.
                    </h1>
                    <p className="text-xl text-gray-500 mb-12 leading-relaxed max-w-2xl mx-auto">
                        ContentPilot scans thousands of sources every day — news, Reddit, LinkedIn trends, and industry publications — then surfaces the 3 most relevant topics for your niche. Ready to write.
                    </p>
                    <Link href="/sign-up">
                        <Button size="lg" className="px-10 text-lg bg-brand text-white hover:bg-brand/90 h-14 shadow-lg hover:scale-105 transition-all">
                            Try Topic Discovery Free
                        </Button>
                    </Link>
                </section>

                {/* Sources */}
                <section className="w-full bg-[#FAFAF7] py-24 border-y border-gray-100">
                    <div className="container mx-auto px-6 max-w-[1100px]">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center tracking-tight">Where we find your topics</h2>
                        <p className="text-gray-500 text-center mb-16 text-lg">ContentPilot aggregates multiple real-time signals so your posts are always relevant.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: Rss, title: 'News & Publications', desc: 'We monitor top-tier publications in your sector, surfacing articles that are trending right now — not yesterday.' },
                                { icon: BarChart2, title: 'LinkedIn Pulse Data', desc: 'We analyze what\'s getting real engagement in your industry so you create content people actually respond to.' },
                                { icon: Search, title: 'Your Custom Sources', desc: 'Add your own RSS feeds, newsletters, or competitor blogs. ContentPilot learns your specific information diet.' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                                    <item.icon className="w-6 h-6 text-brand mb-4" strokeWidth={1.5} aria-hidden="true" />
                                    <h3 className="font-semibold text-lg text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Checklist */}
                <section className="container mx-auto px-6 py-24 max-w-[1100px]">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center tracking-tight">Built for consistent posting</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
                        {[
                            '3 fresh topic briefs delivered every morning',
                            'Auto-classified to your content pillars',
                            'One-click to generate a full draft from any topic',
                            'Topics scored by engagement potential',
                            'Never see the same topic twice',
                            'Skip any topic and get a fresh replacement instantly',
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
