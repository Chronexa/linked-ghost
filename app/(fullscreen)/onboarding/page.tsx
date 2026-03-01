'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { usePostHog } from 'posthog-js/react';


import ScraperLoadingScreen from '@/components/onboarding/scraper-loading-screen';
import ConfirmProfileScreen from '@/components/onboarding/confirm-profile-screen';
import ManualVoiceScreen from '@/components/onboarding/manual-voice-screen';
import LinkedInUrlScreen from '@/components/onboarding/linkedin-url-screen';

/**
 * Smart Onboarding Router
 * ──────────────────────────────────────────────────────────────
 * Routes users to the correct onboarding screen based on their
 * scraper status:
 *
 *  pending  → ScraperLoadingScreen (Apify is running in background)
 *  running  → ScraperLoadingScreen (still processing)
 *  success  → ConfirmProfileScreen (show results for confirmation)
 *  failed   → ManualVoiceScreen    (paste posts manually)
 *  skipped  → LinkedInUrlScreen    (ask for URL / paste posts)
 */

type OnboardingStep = 'loading' | 'checking' | 'url-input' | 'scraping' | 'confirm' | 'manual';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('checking');
  const posthog = usePostHog();
  const startedAt = useRef(Date.now());

  // Fire onboarding_started once on mount
  useEffect(() => {
    posthog?.capture('onboarding_started');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check initial scraper status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    try {
      const res = await fetch('/api/onboarding/scraper-status');
      if (!res.ok) {
        setStep('url-input');
        return;
      }
      const data = await res.json();

      switch (data.scraperStatus) {
        case 'pending':
          // Webhook didn't fire (common on localhost). Auto-trigger the job now.
          // start-scraping will read the LinkedIn URL already stored on the profile.
          try {
            await fetch('/api/onboarding/start-scraping', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({}), // empty body — route will look up linkedinUrl from profile
            });
          } catch {
            // Non-fatal — still show loading screen
          }
          setStep('scraping');
          break;
        case 'running':
          setStep('scraping');
          break;
        case 'success':
          setStep('confirm');
          break;
        case 'failed':
          setStep('manual');
          break;
        case 'not_found':
        case 'skipped':
        default:
          setStep('url-input');
          break;
      }
    } catch {
      setStep('url-input');
    }
  }

  // Handle LinkedIn URL submission from the URL input screen
  async function handleUrlSubmit(url: string) {
    posthog?.capture('onboarding_linkedin_url_submitted');
    try {
      const res = await fetch('/api/onboarding/start-scraping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl: url }),
      });

      if (!res.ok) throw new Error('Failed to start scraping');

      posthog?.capture('onboarding_profile_scrape_started');
      setStep('scraping');
    } catch (err: any) {
      toast.error(err.message || 'Failed to start scraping');
      posthog?.capture('onboarding_profile_scrape_failed', { error_type: 'start_failed' });
      setStep('manual');
    }
  }

  // Handle scraping completion → show confirmation
  const handleScrapingSuccess = useCallback(() => {
    posthog?.capture('onboarding_profile_scrape_completed');
    setStep('confirm');
  }, [posthog]);

  // Handle scraping failure → show manual input
  const handleScrapingFailed = useCallback(() => {
    posthog?.capture('onboarding_profile_scrape_failed', { error_type: 'scrape_failed' });
    setStep('manual');
  }, [posthog]);

  // Handle manual voice analysis completion → show confirmation
  function handleManualComplete() {
    posthog?.capture('onboarding_voice_training_completed', { method: 'manual' });
    setStep('confirm');
  }

  // Handle skip → confirm with defaults
  async function handleSkip() {
    posthog?.capture('onboarding_skipped', { step_name: 'confirm' });
    try {
      // Confirm with no pillars — will use defaults
      await fetch('/api/onboarding/confirm-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmedPillarIds: [],
          removedPillarIds: [],
          voiceArchetype: 'expert',
        }),
      });
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    }
  }

  // Handle profile confirmation → redirect to dashboard immediately
  async function handleConfirm(
    confirmedPillarIds: string[],
    removedPillarIds: string[],
    archetype: string
  ) {
    try {
      const res = await fetch('/api/onboarding/confirm-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmedPillarIds,
          removedPillarIds,
          voiceArchetype: archetype,
        }),
      });

      if (!res.ok) throw new Error('Confirmation failed');

      posthog?.capture('onboarding_profile_confirmed', {
        pillar_count: confirmedPillarIds.length,
        voice_archetype: archetype,
        total_duration_seconds: Math.round((Date.now() - startedAt.current) / 1000),
      });
      posthog?.capture('onboarding_completed', {
        pillar_count: confirmedPillarIds.length,
        total_duration_seconds: Math.round((Date.now() - startedAt.current) / 1000),
      });

      toast.success('🎉 Your AI ghostwriter is ready!');
      // CRITICAL: refresh() forces Next.js to re-fetch the Clerk JWT, picking up
      // the onboardingComplete=true metadata we just set. Without this, the JWT is
      // stale for up to 60s and middleware redirects back to /trial/start every time.
      router.refresh();
      // Small delay gives the refresh a moment to complete before navigating
      await new Promise((resolve) => setTimeout(resolve, 300));
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
      router.push('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFCF2] flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-[#E8E2D8] flex items-center justify-between px-6 lg:px-12 sticky top-0 bg-[#FFFCF2]/90 backdrop-blur z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-[#1A1A1D]">
          <div className="w-8 h-8 bg-[#C1502E] rounded-lg flex items-center justify-center text-white text-sm font-bold">CP</div>
          ContentPilot
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl shadow-black/5 border border-border">
          {step === 'checking' && (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#C1502E] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {step === 'url-input' && (
            <LinkedInUrlScreen
              onSubmitUrl={handleUrlSubmit}
              onSkip={() => setStep('manual')}
            />
          )}

          {step === 'scraping' && (
            <ScraperLoadingScreen
              onSuccess={handleScrapingSuccess}
              onFailed={handleScrapingFailed}
            />
          )}

          {step === 'confirm' && (
            <ConfirmProfileScreen
              onConfirm={handleConfirm}
            />
          )}

          {step === 'manual' && (
            <ManualVoiceScreen
              onComplete={handleManualComplete}
              onSkip={handleSkip}
            />
          )}
        </div>
      </main>

      {/* Footer consent */}
      <footer className="py-4 text-center text-[10px] text-[#B0B0B5] px-6">
        By continuing, you agree that we may analyze your public LinkedIn posts to personalize your writing experience.
        We never post on your behalf or access private data.
      </footer>
    </div>
  );
}
