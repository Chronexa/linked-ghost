import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { FinalCtaSection } from '@/components/landing/final-cta-section';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'How to Use AI for LinkedIn Without Sounding Like a Robot | ContentPilot AI',
    description: 'The right way to use AI for your LinkedIn content — train it on your voice first.',
    alternates: {
        canonical: '/guides/ai-for-linkedin-voice',
    },
    openGraph: {
        type: 'article',
        title: 'How to Use AI for LinkedIn Without Sounding Like a Robot',
        description: 'The right way to use AI for your LinkedIn content — train it on your voice first.',
        url: '/guides/ai-for-linkedin-voice',
    }
};

export default function GuideAILinkedInPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: 'How to Use AI for LinkedIn Without Sounding Like a Robot',
                        description: 'The right way to use AI for your LinkedIn content — train it on your voice first.',
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
                            '@id': 'https://www.linkedinghostwriter-ai.com/guides/ai-for-linkedin-voice',
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
                    <span className="text-xs font-bold text-brand uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full">AI Tools</span>
                    <span className="text-sm text-gray-400">7 min read</span>
                </div>

                <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-[1.1] tracking-tight text-gray-900">
                    How to Use AI for LinkedIn Without Sounding Like a Robot
                </h1>
                <p className="text-xl text-gray-500 mb-12 leading-relaxed">
                    The key is training the AI on your voice before anything else. Here&apos;s the exact setup process.
                </p>

                <div className="prose prose-gray prose-lg max-w-none space-y-8 text-gray-600 leading-relaxed">
                    <p>
                        The reason most AI-generated LinkedIn posts sound robotic isn&apos;t the AI — it&apos;s that people use the same generic prompt that thousands of others use. The output is identical because the input is identical.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Step 1: Collect 10 of your best posts</h2>
                    <p>
                        Before you touch any AI tool, gather the LinkedIn posts you&apos;re proudest of. These should represent the range of formats you use — stories, insights, lists. They are your voice fingerprint.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Step 2: Extract your voice rules</h2>
                    <p>
                        Notice patterns: How long are your sentences? Do you write in first-person? Do you use questions? Do you start posts with a bold claim or a story? These patterns are your voice — and an AI needs to be explicitly told to match them.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Step 3: Use a tool that learns, not just generates</h2>
                    <p>
                        This is where ContentPilot is fundamentally different from ChatGPT. We don&apos;t just take a prompt — we build a persistent voice profile from your example posts and apply it to every single piece of content generated. The result is a match score you can actually verify.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">The one rule that makes everything better</h2>
                    <p>
                        Always edit the first sentence. AI nails the structure and substance, but the opening hook is often the most distinctly human part of any good post. Spend 30 seconds rewriting the first line and the whole post immediately feels more like you.
                    </p>
                </div>
            </main>
            <FinalCtaSection />
            <Footer />
        </div>
    );
}
