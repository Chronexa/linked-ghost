import { Navbar } from '@/components/landing/navbar';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { FinalCtaSection } from '@/components/landing/final-cta-section';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui';
import Link from 'next/link';

export const metadata = {
    title: 'ContentPilot AI for Founders | Build Your Personal Brand',
    description: 'Raise capital, attract top talent, and build credibility. ContentPilot is the LinkedIn ghostwriter for busy startup founders.',
};

export default function FoundersPage() {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-brand/20 selection:text-brand-dark">
            <Navbar />

            <main>
                {/* Persona-Specific Hero */}
                <section className="container mx-auto px-6 pt-32 pb-24 text-center">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-block bg-blue-50 text-brand px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-8 border border-blue-100">
                            CONTENTPILOT AI FOR FOUNDERS
                        </div>
                        <h1 className="font-display text-5xl md:text-6xl font-bold mb-8 leading-[1.1] tracking-tight text-gray-900">
                            Raise capital. Attract talent.<br />Build your founder brand.
                        </h1>
                        <p className="text-xl text-gray-500 mb-12 leading-relaxed max-w-2xl mx-auto">
                            Investors and candidates check your LinkedIn before every call.
                            ContentPilot generates authentic, thought-leadership posts in your exact voice—taking only 3 minutes a day.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
                            <Link href="/sign-up">
                                <Button size="lg" className="px-10 text-lg bg-brand text-white hover:bg-brand/90 w-full sm:w-auto h-14 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                    Start Your 7-Day Free Trial
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Persona-Specific Problem */}
                <section className="w-full bg-[#FAFAF7] py-24 border-y border-gray-100">
                    <div className="container mx-auto px-6 max-w-[1100px]">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                                Founders don't have time to write.
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: "No Time", desc: "You're busy building the product. Spending 2 hours drafting a post isn't an option." },
                                { title: "Generic AI is Obvious", desc: "Investors can spot ChatGPT from a mile away. It hurts your credibility." },
                                { title: "The Consistency Trap", desc: "You post three times after a launch, then go silent for six months." }
                            ].map((card, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-3">{card.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Reused Generic Sections */}
                <HowItWorksSection />
                <TestimonialsSection />
                <PricingSection />
                <FinalCtaSection />
            </main>

            <Footer />
        </div>
    );
}
