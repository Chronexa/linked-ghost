import Link from 'next/link';
import { Button } from '@/components/ui';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-surface border-b border-border backdrop-blur-sm bg-surface/95">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white font-display font-bold text-xl">CP</span>
              </div>
              <span className="text-xl font-display font-semibold text-charcoal">
                ContentPilot AI
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-charcoal-light hover:text-charcoal transition font-medium">
                Features
              </Link>
              <Link href="#pricing" className="text-charcoal-light hover:text-charcoal transition font-medium">
                Pricing
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-brand/5 border border-brand/20 rounded-full mb-6">
            <span className="text-sm font-medium text-brand-text">
              ✨ AI-Powered LinkedIn Content in Your Voice
            </span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold text-charcoal mb-6 leading-[1.1] tracking-tight">
            Your LinkedIn Ghostwriter<br />
            <span className="text-brand">
              That Sounds Like You
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-charcoal-light mb-10 max-w-3xl mx-auto leading-relaxed">
            Transform industry news, insights, and data into engaging LinkedIn posts in under 3 minutes
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/onboarding">
              <Button size="lg" className="px-8 text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="px-8 text-lg">
              Watch Demo
            </Button>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-brand/10 rounded-2xl blur-3xl"></div>
            <div className="relative bg-surface rounded-2xl shadow-card-hover p-8 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                </div>
                <span className="text-sm text-charcoal-light font-mono">contentpilot.ai/create</span>
              </div>
              <div className="bg-background rounded-lg p-6 text-left">
                <div className="space-y-3">
                  <div className="h-3 bg-border rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-border rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-border rounded w-5/6 animate-pulse"></div>
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Generated in 2.3s
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4">
            Everything You Need to Dominate LinkedIn
          </h2>
          <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
            Powered by AI that learns your voice and writing style
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-surface rounded-xl border border-border p-8 hover:shadow-card-hover transition-all duration-200">
            <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-semibold text-charcoal mb-2">
              Multi-Source Intelligence
            </h3>
            <p className="text-charcoal-light leading-relaxed">
              Pulls content from news, Reddit, meetings, and your data automatically
            </p>
          </div>

          <div className="bg-surface rounded-xl border border-border p-8 hover:shadow-card-hover transition-all duration-200">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-success-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-semibold text-charcoal mb-2">
              Voice Cloning
            </h3>
            <p className="text-charcoal-light leading-relaxed">
              Learns from your past posts to match your tone perfectly
            </p>
          </div>

          <div className="bg-surface rounded-xl border border-border p-8 hover:shadow-card-hover transition-all duration-200">
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-semibold text-charcoal mb-2">
              Smart Classification
            </h3>
            <p className="text-charcoal-light leading-relaxed">
              Auto-sorts content by your content pillars intelligently
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-16 md:py-24 bg-background">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-charcoal-light">
            Start free, upgrade as you grow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: 'Starter',
              price: '$29',
              posts: '10 posts',
              pillars: '2 pillars',
              features: ['Multi-source research', 'Voice cloning', 'Basic analytics'],
            },
            {
              name: 'Growth',
              price: '$79',
              posts: '30 posts',
              pillars: '5 pillars',
              features: ['Everything in Starter', 'Priority support', 'Advanced analytics', 'Custom scheduling'],
              featured: true,
            },
            {
              name: 'Agency',
              price: '$199',
              posts: 'Unlimited',
              pillars: '10 pillars',
              features: ['Everything in Growth', 'Team collaboration', 'White-label options', 'Dedicated support'],
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`rounded-xl p-8 ${
                plan.featured
                  ? 'bg-brand text-white shadow-warm scale-105'
                  : 'bg-surface border border-border'
              }`}
            >
              <h3 className={`font-display text-2xl font-bold mb-2 ${plan.featured ? 'text-white' : 'text-charcoal'}`}>
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className={`text-5xl font-bold ${plan.featured ? 'text-white' : 'text-charcoal'}`}>
                  {plan.price}
                </span>
                <span className={`text-lg ${plan.featured ? 'text-white/80' : 'text-charcoal-light'}`}>
                  /month
                </span>
              </div>
              <div className={`text-sm mb-6 ${plan.featured ? 'text-white/90' : 'text-charcoal-light'}`}>
                <div>{plan.posts} per month</div>
                <div>{plan.pillars}</div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start">
                    <svg
                      className={`w-5 h-5 mr-2 mt-0.5 flex-shrink-0 ${
                        plan.featured ? 'text-white' : 'text-success'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className={plan.featured ? 'text-white/90' : 'text-charcoal-light'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/onboarding">
                <Button
                  variant={plan.featured ? 'secondary' : 'primary'}
                  className="w-full"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">CP</span>
              </div>
              <span className="font-display font-semibold text-charcoal">ContentPilot AI</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a
                href="https://www.producthunt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-charcoal-light hover:text-brand transition"
              >
                Product Hunt
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-charcoal-light hover:text-brand transition"
              >
                Twitter
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-charcoal-light">
            © 2026 ContentPilot AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
