import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { FinalCtaSection } from '@/components/landing/final-cta-section';

export const metadata = {
    title: 'Changelog | ContentPilot AI',
    description: 'See the latest features, improvements, and fixes we have shipped to help you grow on LinkedIn.',
};

export default function ChangelogPage() {
    return (
        <div className="min-h-screen bg-[#FAFAF7] font-sans selection:bg-brand/20 selection:text-brand-dark">
            <Navbar />

            <main>
                <section className="container mx-auto px-6 pt-32 pb-24 max-w-3xl">
                    <div className="mb-16">
                        <h1 className="font-display text-5xl font-bold mb-6 tracking-tight text-gray-900">
                            Changelog
                        </h1>
                        <p className="text-xl text-gray-500 leading-relaxed">
                            New features, improvements, and bug fixes to help you conquer LinkedIn. We ship fast.
                        </p>
                    </div>

                    <div className="space-y-16 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">

                        {/* Entry 1 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-brand text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2L2 22l10-4 10 4L12 2z" /></svg>
                            </div>

                            {/* Content */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-8 rounded-2xl border border-gray-100 shadow-sm ml-12 md:ml-0">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                                    <div className="text-sm font-bold text-brand uppercase tracking-wider bg-brand/10 px-3 py-1 rounded-full">
                                        Landing Page V2
                                    </div>
                                    <time className="text-sm text-gray-400 font-medium">February 24, 2026</time>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">The "Enterprise Polish" Update</h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    We've completely overhauled our landing page architecture. We ripped out all generic AI aesthetics, eliminated every single emoji, and rebuilt the site from the ground up utilizing best-in-class Framer Motion interactive UI elements.
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700">
                                    <ul className="list-disc list-inside space-y-2">
                                        <li>Added "Notion-style" interactive Tab Switcher</li>
                                        <li>Introduced cinematic scroll-triggered typing visualizations</li>
                                        <li>Refactored architecture into modular React Server Components</li>
                                        <li>Deployed "Spiderweb" SEO Use-Case routing strategy</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Entry 2 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2L2 22l10-4 10 4L12 2z" /></svg>
                            </div>

                            {/* Content */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white p-8 rounded-2xl border border-gray-100 shadow-sm ml-12 md:ml-0 opacity-80 transition-opacity hover:opacity-100">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                                    <div className="text-sm font-bold text-gray-600 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
                                        Topic Discovery Engine
                                    </div>
                                    <time className="text-sm text-gray-400 font-medium">February 15, 2026</time>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Source Intake V1</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    ContentPilot no longer just guesses what to write about. We officially launched the Multi-Source Intelligence Engine, allowing the AI to pull real-time sentiment from Reddit, news articles, and your provided PDFs to construct highly relevant daily posts.
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

                <FinalCtaSection />
            </main>

            <Footer />
        </div>
    );
}
