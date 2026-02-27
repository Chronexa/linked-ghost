import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { FinalCtaSection } from '@/components/landing/final-cta-section';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'How the LinkedIn Algorithm Works in 2026 | ContentPilot AI',
    description: 'A practical breakdown of what LinkedIn actually rewards — and what tanks your reach — in 2026.',
};

export default function GuideLinkedInAlgorithmPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />
            <main className="container mx-auto px-6 pt-32 pb-24 max-w-3xl">
                <Link href="/guides" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-10 font-medium">
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Guides
                </Link>

                <div className="mb-3 flex items-center gap-3">
                    <span className="text-xs font-bold text-brand uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full">Strategy</span>
                    <span className="text-sm text-gray-400">8 min read</span>
                </div>

                <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-[1.1] tracking-tight text-gray-900">
                    How the LinkedIn Algorithm Really Works in 2026
                </h1>
                <p className="text-xl text-gray-500 mb-12 leading-relaxed">
                    A practical breakdown of what LinkedIn actually rewards — and what it penalizes. Stop guessing, start optimizing.
                </p>

                <div className="prose prose-gray prose-lg max-w-none space-y-8 text-gray-600 leading-relaxed">
                    <p>
                        LinkedIn&apos;s algorithm has evolved significantly. In 2026, it prioritizes <strong>dwell time</strong> (how long people read your post) and <strong>early engagement velocity</strong> (how fast you get comments in the first 60 minutes) over raw like counts.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">What the algorithm now rewards</h2>
                    <ul className="list-disc list-outside pl-6 space-y-3">
                        <li><strong>Comments over likes.</strong> A comment is worth roughly 6× a like in LinkedIn&apos;s current scoring model. Posts that generate conversation get shown to 2nd-degree connections.</li>
                        <li><strong>Saves.</strong> When someone saves your post, LinkedIn treats it as a very high-quality signal. Write posts people want to return to.</li>
                        <li><strong>Dwell time.</strong> &quot;Click more&quot; posts that expand with a hook do better — but only if people actually read after expanding. Clickbait that doesn&apos;t deliver gets suppressed after day 1.</li>
                        <li><strong>Posting at the right time.</strong> Tuesday–Thursday, 7–9am and 12–1pm in your audience&apos;s timezone still outperform other slots.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">What gets you penalized</h2>
                    <ul className="list-disc list-outside pl-6 space-y-3">
                        <li><strong>External links in the body.</strong> LinkedIn suppresses posts with external links. Always put links in the first comment.</li>
                        <li><strong>Hashtag spam.</strong> 3 targeted hashtags outperform 15 generic ones.</li>
                        <li><strong>Posting and ghosting.</strong> If you don&apos;t reply to comments in the first 2 hours, the algorithm stops distributing your post.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">The ContentPilot Advantage</h2>
                    <p>
                        ContentPilot generates posts that are naturally structured for high dwell-time — narrative hooks, strong "click more" breaks, and clear takeaways that drive saves and comments. You don&apos;t need to think about the algorithm; we&apos;ve already optimized for it.
                    </p>
                </div>
            </main>
            <FinalCtaSection />
            <Footer />
        </div>
    );
}
