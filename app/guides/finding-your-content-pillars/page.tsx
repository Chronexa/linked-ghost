import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { FinalCtaSection } from '@/components/landing/final-cta-section';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'How to Find Your Content Pillars | ContentPilot AI',
    description: 'Define the 3–5 topics you should own on LinkedIn. A framework from ContentPilot AI.',
    alternates: {
        canonical: '/guides/finding-your-content-pillars',
    },
    openGraph: {
        type: 'article',
        title: 'How to Find Your 3–5 Core Content Pillars',
        description: 'Define the 3–5 topics you should own on LinkedIn. A framework from ContentPilot AI.',
        url: '/guides/finding-your-content-pillars',
    }
};

export default function GuideContentPillarsPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: 'How to Find Your 3–5 Core Content Pillars',
                        description: 'Define the 3–5 topics you should own on LinkedIn. A framework from ContentPilot AI.',
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
                            '@id': 'https://www.linkedinghostwriter-ai.com/guides/finding-your-content-pillars',
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
                    <span className="text-xs font-bold text-brand uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full">Content</span>
                    <span className="text-sm text-gray-400">6 min read</span>
                </div>

                <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-[1.1] tracking-tight text-gray-900">
                    How to Find Your 3–5 Core Content Pillars
                </h1>
                <p className="text-xl text-gray-500 mb-12 leading-relaxed">
                    The most common mistake LinkedIn creators make is posting randomly. Here&apos;s the framework for defining the 3–5 topics you should own.
                </p>

                <div className="prose prose-gray prose-lg max-w-none space-y-8 text-gray-600 leading-relaxed">
                    <p>
                        A content pillar is a topic area you return to repeatedly. It tells your audience what to expect from you and tells the algorithm who to show your posts to.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">The 3-pillar formula</h2>
                    <p>For most professionals, the ideal structure is:</p>
                    <ul className="list-disc list-outside pl-6 space-y-3">
                        <li><strong>Your expertise</strong> — What do you know at a level most people don&apos;t? This is your primary authority topic.</li>
                        <li><strong>Your industry lens</strong> — What trends, news, or shifts in your sector do you have a unique perspective on?</li>
                        <li><strong>Your personal narrative</strong> — The founder journey, consultant life, lessons from failures. This builds relatability and trust.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">How to identify yours</h2>
                    <ol className="list-decimal list-outside pl-6 space-y-4">
                        <li>Write down 20 questions you&apos;ve been asked by clients or peers. These are your expertise pillars.</li>
                        <li>List 5 LinkedIn creators you respect in your space. What do they never talk about that would complement their work? That&apos;s your gap.</li>
                        <li>Look at which of your past posts got the most engagement. Group them — the common thread is your natural pillar.</li>
                    </ol>
                </div>
            </main>
            <FinalCtaSection />
            <Footer />
        </div>
    );
}
