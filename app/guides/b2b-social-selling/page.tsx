import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { FinalCtaSection } from '@/components/landing/final-cta-section';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'B2B Social Selling on LinkedIn | ContentPilot AI',
    description: 'Turn LinkedIn views into inbound leads. A tactical guide to B2B social selling from ContentPilot AI.',
    alternates: {
        canonical: '/guides/b2b-social-selling',
    },
    openGraph: {
        type: 'article',
        title: 'B2B Social Selling: Turning LinkedIn Views Into Pipeline',
        description: 'Turn LinkedIn views into inbound leads. A tactical guide to B2B social selling from ContentPilot AI.',
        url: '/guides/b2b-social-selling',
    }
};

export default function GuideSocialSellingPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: 'B2B Social Selling: Turning LinkedIn Views Into Pipeline',
                        description: 'Turn LinkedIn views into inbound leads. A tactical guide to B2B social selling from ContentPilot AI.',
                        author: {
                            '@type': 'Organization',
                            name: 'LinkedIn Ghostwriter AI',
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: 'LinkedIn Ghostwriter AI',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://www.linkedinghostwriter-ai.com/favicon.ico',
                            },
                        },
                        mainEntityOfPage: {
                            '@type': 'WebPage',
                            '@id': 'https://www.linkedinghostwriter-ai.com/guides/b2b-social-selling',
                        },
                    }),
                }}
            />
            <Navbar />
            <main className="container mx-auto px-6 pt-32 pb-24 max-w-3xl">
                <Link href="/guides" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-10 font-medium">
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Guides
                </Link>

                <div className="mb-3 flex items-center gap-3">
                    <span className="text-xs font-bold text-brand uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full">Strategy</span>
                    <span className="text-sm text-gray-400">10 min read</span>
                </div>

                <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-[1.1] tracking-tight text-gray-900">
                    B2B Social Selling: Turning LinkedIn Views Into Pipeline
                </h1>
                <p className="text-xl text-gray-500 mb-12 leading-relaxed">
                    Thought leadership only works if it converts. Here&apos;s how to write posts that generate inbound DMs, not just likes.
                </p>

                <div className="prose prose-gray prose-lg max-w-none space-y-8 text-gray-600 leading-relaxed">
                    <p>
                        Most LinkedIn creators confuse reach with revenue. Getting 10,000 views on a post is meaningless if it doesn&apos;t generate inbound interest. Social selling requires a different structure.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">The 3-post framework for inbound leads</h2>
                    <ul className="list-disc list-outside pl-6 space-y-4">
                        <li><strong>The Problem Post.</strong> Describe a painful problem your ICP has, in their exact language. Don&apos;t pitch. Just name the pain. This attracts the right people.</li>
                        <li><strong>The Insight Post.</strong> Share a counter-intuitive take on how to solve that problem. This establishes credibility without a sales pitch.</li>
                        <li><strong>The Result Post.</strong> Share a real outcome or case study — no names needed. &quot;A client went from X to Y in Z days.&quot; This generates DMs.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">The soft CTA that converts</h2>
                    <p>
                        Never end a post with &quot;DM me to learn more.&quot; Instead, use a question that filters for buyers: &quot;If this resonates, I&apos;d love to hear what your current process looks like — drop it in the comments.&quot; The people who respond are already pre-qualified.
                    </p>
                </div>
            </main>
            <FinalCtaSection />
            <Footer />
        </div>
    );
}
