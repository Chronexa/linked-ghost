import { Layers, Mic, BarChart, Sparkles } from 'lucide-react';

export function FeatureGridSection() {
    return (
        <section className="w-full bg-white py-32 border-t border-gray-100" aria-label="Features">
            <div className="container mx-auto px-6 max-w-[1100px]">
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                        Everything you need to dominate LinkedIn.
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <div className="bg-[#FAFAFA] rounded-2xl border border-gray-100 p-8 flex flex-col justify-start">
                        <Layers className="w-5 h-5 text-gray-800 mb-5" strokeWidth={1.5} aria-hidden="true" />
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Multi-Source Intelligence</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">
                            Pulls content from news, Reddit, meetings, and your data automatically to find trending topics.
                        </p>
                    </div>

                    <div className="bg-[#FAFAFA] rounded-2xl border border-gray-100 p-8 flex flex-col justify-start">
                        <Mic className="w-5 h-5 text-gray-800 mb-5" strokeWidth={1.5} aria-hidden="true" />
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Voice Cloning</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">
                            Learns from your past posts to match your tone, vocabulary, and sentence structure perfectly.
                        </p>
                    </div>

                    <div className="bg-[#FAFAFA] rounded-2xl border border-gray-100 p-8 flex flex-col justify-start">
                        <BarChart className="w-5 h-5 text-gray-800 mb-5" strokeWidth={1.5} aria-hidden="true" />
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Smart Classification</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">
                            Auto-sorts generated content by your defined content pillars intelligently to maintain balanced messaging.
                        </p>
                    </div>

                    <div className="bg-[#FAFAFA] rounded-2xl border border-gray-100 p-8 flex flex-col justify-start">
                        <Sparkles className="w-5 h-5 text-gray-800 mb-5" strokeWidth={1.5} aria-hidden="true" />
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Post Variants</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">
                            Get 3 ready-to-post options per topic. Pick the one that resonates best, refine it, and publish.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
