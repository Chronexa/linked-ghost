import { Navbar } from '@/components/landing/navbar';
import { HeroSection } from '@/components/landing/hero-section';
import { StatsSection } from '@/components/landing/stats-section';
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
  title: 'LinkedIn Ghostwriter AI | AI-powered LinkedIn posts in your voice',
  description: 'LinkedIn Ghostwriter AI researches trending topics in your niche, learns your writing style, and generates ready-to-post LinkedIn drafts — every day in under 3 minutes. No credit card required.',
  keywords: [
    'LinkedIn ghostwriter AI',
    'AI LinkedIn post generator',
    'LinkedIn content automation tool',
    'write LinkedIn posts automatically',
    'AI ghostwriter for LinkedIn',
    'LinkedIn personal branding tool',
    'LinkedIn content creator AI',
    'automate LinkedIn posting',
  ],
  alternates: {
    canonical: 'https://www.linkedinghostwriter-ai.com',
  },
  openGraph: {
    title: 'LinkedIn Ghostwriter AI — Posts in your voice, in 3 minutes',
    description: 'Stop staring at a blank page. Get AI-generated LinkedIn posts that sound exactly like you.',
    url: 'https://www.linkedinghostwriter-ai.com',
    siteName: 'LinkedIn Ghostwriter AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LinkedIn Ghostwriter AI — AI-powered LinkedIn content in your voice',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkedIn Ghostwriter AI',
    description: 'AI-powered LinkedIn posts in your voice, in 3 minutes.',
    images: ['/og-image.png'],
  },
};

// JSON-LD structured data for rich results
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'LinkedIn Ghostwriter AI',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://www.linkedinghostwriter-ai.com',
      description: 'AI-powered LinkedIn content creation tool that researches trending topics, learns your writing voice, and generates ready-to-post LinkedIn drafts in under 3 minutes.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: '7-day free trial',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '47',
      },
    },
    {
      '@type': 'Organization',
      name: 'LinkedIn Ghostwriter AI',
      url: 'https://www.linkedinghostwriter-ai.com',
      logo: 'https://www.linkedinghostwriter-ai.com/og-image.png',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is LinkedIn Ghostwriter AI?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'LinkedIn Ghostwriter AI is an AI-powered tool that researches trending topics in your industry, learns your unique writing style from past posts, and generates ready-to-post LinkedIn content drafts in under 3 minutes.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does LinkedIn Ghostwriter AI learn my writing style?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'During onboarding, the tool analyzes your past LinkedIn posts to build a voice profile — capturing your tone, sentence structure, vocabulary, and content style. Every generated post is matched to this profile.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is there a free trial?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. LinkedIn Ghostwriter AI offers a 7-day free trial with no credit card required. You can start generating posts immediately after signing up.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is this different from ChatGPT or other AI writing tools?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Unlike general AI tools, LinkedIn Ghostwriter AI is purpose-built for LinkedIn. It automatically finds relevant trending topics so you never start from a blank page, and it generates content in your specific voice — not generic AI-sounding prose.',
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      {/* Structured data for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white font-sans selection:bg-brand/20 selection:text-brand-dark">
        <Navbar />
        <main>
          <HeroSection />
          <StatsSection />
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
    </>
  );
}
