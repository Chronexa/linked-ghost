import { Navbar } from '@/components/landing/navbar';
import { HeroSection } from '@/components/landing/hero-section';
import { SocialProofSection } from '@/components/landing/social-proof-section';
import { ProblemSection } from '@/components/landing/problem-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { WatchItWorkSection } from '@/components/landing/watch-it-work-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { FeatureGridSection } from '@/components/landing/feature-grid-section';
import { ComparisonSection } from '@/components/landing/comparison-section';
import { FaqSection } from '@/components/landing/faq-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { FinalCtaSection } from '@/components/landing/final-cta-section';
import { Footer } from '@/components/landing/footer';

export const metadata = {
  title: 'ContentPilot AI | Your LinkedIn ghostwriter that sounds like you',
  description: 'ContentPilot researches trending topics in your niche, learns your writing style, and generates ready-to-post LinkedIn drafts — every day in under 3 minutes.',
  openGraph: {
    title: 'ContentPilot AI',
    description: 'Stop staring at a blank page. Get AI-generated LinkedIn posts in your unique voice.',
    url: 'https://contentpilot.ai',
    siteName: 'ContentPilot AI',
    locale: 'en_US',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand/20 selection:text-brand-dark">
      <Navbar />
      <main>
        <HeroSection />
        <SocialProofSection />
        <ProblemSection />
        <HowItWorksSection />
        <WatchItWorkSection />
        <TestimonialsSection />
        <FeatureGridSection />
        <ComparisonSection />
        <FaqSection />
        <PricingSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}
