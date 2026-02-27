import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { FinalCtaSection } from '@/components/landing/final-cta-section';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'LinkedIn Growth Guides | ContentPilot AI',
    description: 'Free, actionable guides on growing your personal brand on LinkedIn. Strategy, content, and AI tips from the team at ContentPilot.',
};

const guides = [
    {
        category: 'Strategy',
        title: 'How the LinkedIn Algorithm Really Works in 2026',
        desc: 'A practical, up-to-date breakdown of what LinkedIn actually rewards — and what it penalizes. Stop guessing, start optimizing.',
        readTime: '8 min read',
        slug: 'linkedin-algorithm-2026',
    },
    {
        category: 'Content',
        title: 'How to Find Your 3–5 Core Content Pillars',
        desc: 'The most common mistake LinkedIn creators make is posting randomly. Here\'s the framework for defining the 3–5 topics you should own.',
        readTime: '6 min read',
        slug: 'finding-your-content-pillars',
    },
    {
        category: 'Strategy',
        title: 'B2B Social Selling: Turning LinkedIn Views Into Pipeline',
        desc: 'Thought leadership only works if it convert. We break down how to write posts that generate inbound DMs, not just likes.',
        readTime: '10 min read',
        slug: 'b2b-social-selling',
    },
    {
        category: 'AI Tools',
        title: 'How to Use AI for LinkedIn Without Sounding Like a Robot',
        desc: 'The key is training the AI on your voice first. We walk through exactly how to set that up — with and without ContentPilot.',
        readTime: '7 min read',
        slug: 'ai-for-linkedin-voice',
    },
];

export default function GuidesPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />
            <main>
                {/* Header */}
                <section className="container mx-auto px-6 pt-32 pb-16 max-w-[1100px]">
                    <div className="max-w-2xl">
                        <h1 className="font-display text-5xl font-bold mb-6 tracking-tight text-gray-900">
                            Guides & Resources
                        </h1>
                        <p className="text-xl text-gray-500 leading-relaxed">
                            No-fluff playbooks for growing your LinkedIn presence. Written by practitioners, not marketers.
                        </p>
                    </div>
                </section>

                {/* Guide Cards */}
                <section className="container mx-auto px-6 pb-32 max-w-[1100px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {guides.map((guide, i) => (
                            <article key={i} className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-gray-300 hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-brand uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full">
                                        {guide.category}
                                    </span>
                                    <span className="text-sm text-gray-400">{guide.readTime}</span>
                                </div>
                                <h2 className="font-display text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-brand transition-colors">
                                    {guide.title}
                                </h2>
                                <p className="text-gray-500 leading-relaxed mb-6 text-sm">
                                    {guide.desc}
                                </p>
                                <Link href={`/guides/${guide.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:gap-3 transition-all">
                                    Read Guide <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>

                <FinalCtaSection />
            </main>
            <Footer />
        </div>
    );
}
