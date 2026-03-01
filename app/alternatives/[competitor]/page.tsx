import { competitors } from '@/lib/seo/competitors';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { FinalCtaSection } from '@/components/landing/final-cta-section';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    return competitors.map((c) => ({
        competitor: c.slug,
    }));
}

export async function generateMetadata({ params }: { params: { competitor: string } }) {
    const comp = competitors.find((c) => c.slug === params.competitor);
    if (!comp) return {};

    return {
        title: `LinkedIn Ghostwriter AI vs ${comp.name} | The Best ${comp.name} Alternative (2026)`,
        description: `Comparing ${comp.name} vs LinkedIn Ghostwriter AI. Find out why founders are switching from ${comp.type.toLowerCase()}s to true AI voice cloning.`,
        alternates: {
            canonical: `/alternatives/${comp.slug}`,
        }
    };
}

export default function CompetitorAlternativePage({ params }: { params: { competitor: string } }) {
    const comp = competitors.find((c) => c.slug === params.competitor);

    if (!comp) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-brand/20 selection:text-brand-dark">
            <Navbar />

            <main className="pt-32 pb-24">
                <section className="container mx-auto px-6 max-w-4xl text-center">
                    <div className="inline-block bg-blue-50 text-brand px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-8 border border-blue-100">
                        COMPARING LINKEDIN TOOLS
                    </div>
                    <h1 className="font-display text-4xl md:text-6xl font-bold mb-8 leading-[1.1] tracking-tight text-gray-900">
                        The Best Alternative to <span className="text-brand">{comp.name}</span>
                    </h1>
                    <p className="text-xl text-gray-500 mb-12 leading-relaxed max-w-2xl mx-auto">
                        If you're looking to graduate from generic {comp.type.toLowerCase()}s to an AI that actually sounds like you, you're in the right place.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
                        <Link href="/sign-up">
                            <Button size="lg" className="px-10 text-lg bg-brand text-white hover:bg-brand/90 w-full sm:w-auto h-14 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                Start Your 7-Day Free Trial
                            </Button>
                        </Link>
                    </div>
                </section>

                <section className="bg-[#FAFAF7] py-24 border-y border-gray-100">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gray-200" />
                                <h2 className="text-2xl font-bold mb-4 text-gray-900">Where {comp.name} falls short</h2>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    {comp.name} is {comp.shortDescription} However, their biggest weakness is content quality.
                                </p>
                                <div className="p-4 bg-red-50 text-red-900 rounded-xl border border-red-100 mb-6">
                                    <strong className="block mb-2 text-red-700">The Problem:</strong>
                                    {comp.weakness}
                                </div>
                            </div>

                            <div className="bg-white p-10 rounded-3xl border border-brand/20 shadow-xl shadow-brand/5 relative overflow-hidden transform md:-translate-y-4">
                                <div className="absolute top-0 left-0 w-full h-2 bg-brand" />
                                <h2 className="text-2xl font-bold mb-4 text-gray-900">The LinkedIn Ghostwriter Advantage</h2>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    We don't just format or schedule posts. We are a dedicated intelligence layer for your personal brand.
                                </p>
                                <div className="p-4 bg-blue-50 text-brand-dark rounded-xl border border-blue-100 mb-6 font-medium">
                                    <strong className="block mb-2 text-brand">The Solution:</strong>
                                    {comp.ourAdvantage}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <FinalCtaSection />
            <Footer />
        </div>
    );
}
