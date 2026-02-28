import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { FinalCtaSection } from '@/components/landing/final-cta-section';

export const metadata = {
    title: 'About | ContentPilot AI',
    description: 'ContentPilot AI is on a mission to give every professional the ability to build a meaningful LinkedIn presence without spending hours writing.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />
            <main>
                <section className="container mx-auto px-6 pt-32 pb-24 max-w-3xl">
                    <h1 className="font-display text-5xl font-bold mb-8 tracking-tight text-gray-900">
                        We believe every professional has something worth saying.
                    </h1>
                    <div className="prose prose-lg text-gray-600 leading-relaxed space-y-6">
                        <p>
                            LinkedIn is the world&apos;s largest professional stage, but most people who belong on it never post. Not because they lack ideas — but because the blank page wins. Every time.
                        </p>
                        <p>
                            LinkedIn Ghostwriter AI was built to solve exactly that. We combine real-time topic research with deep AI voice cloning so that you can spend 3 minutes a day maintaining a consistent, authentic LinkedIn presence — instead of 3 hours or none at all.
                        </p>
                        <p>
                            We are a small, focused team that cares deeply about making AI that doesn&apos;t feel like AI. Our benchmark is simple: if your audience can tell it&apos;s generated, we haven&apos;t done our job.
                        </p>
                    </div>

                    {/* Values */}
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Authentic First', desc: 'We optimize for voice match, not output volume.' },
                            { title: 'Ship Fast', desc: 'We deploy improvements weekly. Check the changelog.' },
                            { title: 'Simple Pricing', desc: 'No hidden fees. No feature gating. Cancel anytime.' },
                        ].map((v, i) => (
                            <div key={i} className="border-t-2 border-brand pt-6">
                                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <FinalCtaSection />
            </main>
            <Footer />
        </div>
    );
}
