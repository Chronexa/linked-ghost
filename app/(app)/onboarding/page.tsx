'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui';
import { StepProfile, ProfileData } from '@/components/onboarding/step-profile';
import { StepPillars } from '@/components/onboarding/step-pillars';
import { StepVoice, VoiceData } from '@/components/onboarding/step-voice';
import { useCreatePillar } from '@/lib/hooks/use-pillars';
import { useAddVoiceExample } from '@/lib/hooks/use-voice';
import { useUpdateProfile } from '@/lib/hooks/use-user';
import { showSuccess, showError } from '@/lib/toast-utils';

const ONBOARDING_STEP_KEY = 'contentpilot_onboarding_step_v2';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(33);

  // State for all steps
  const [profileData, setProfileData] = useState<ProfileData>({
    contentGoal: 'brand',
    targetAudience: '',
    linkedinUrl: ''
  });
  const [pillars, setPillars] = useState<string[]>([]);
  const [voiceData, setVoiceData] = useState<VoiceData>({ primarySample: '' });

  // API Hooks
  const createPillar = useCreatePillar();
  const addVoiceExample = useAddVoiceExample();
  const updateProfile = useUpdateProfile();

  // Load progress from localStorage
  useEffect(() => {
    const savedStep = localStorage.getItem(ONBOARDING_STEP_KEY);
    if (savedStep) {
      const step = parseInt(savedStep);
      // Don't restore if complete (step 4 or higher means completed)
      if (step < 4) {
        setCurrentStep(step);
        setProgress(step === 1 ? 33 : step === 2 ? 66 : 100);
      }
    }
  }, []);

  const saveProgress = (step: number) => {
    setCurrentStep(step);
    setProgress(step === 1 ? 33 : step === 2 ? 66 : 100);
    localStorage.setItem(ONBOARDING_STEP_KEY, step.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProfileNext = async (data: ProfileData) => {
    try {
      setProfileData(data);
      await updateProfile.mutateAsync({
        contentGoal: data.contentGoal,
        customGoal: data.customGoal,
        targetAudience: data.targetAudience,
        linkedinUrl: data.linkedinUrl,
      });
      saveProgress(2);
    } catch (error) {
      showError("Failed to save profile data. Please try again.");
    }
  };

  const handlePillarsNext = async (selectedPillars: string[]) => {
    try {
      setPillars(selectedPillars);
      // Persist to DB immediately
      await Promise.all(selectedPillars.map(name => createPillar.mutateAsync({ name })));
      saveProgress(3);
    } catch (error) {
      showError("Failed to save pillars. Please try again.");
    }
  };

  const handleVoiceNext = async (data: VoiceData) => {
    try {
      setVoiceData(data);
      // Voice samples
      const promises = [];
      if (data.primarySample?.trim()) {
        promises.push(addVoiceExample.mutateAsync({ postText: data.primarySample }));
      }
      if (data.additionalSamples) {
        data.additionalSamples.forEach(sample => {
          if (sample.trim()) promises.push(addVoiceExample.mutateAsync({ postText: sample }));
        });
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      // Mark onboarding complete and auto-enable research
      await updateProfile.mutateAsync({
        perplexityEnabled: true,
        onboardingCompletedAt: new Date(),
      });

      // Onboarding complete - redirect to dashboard
      localStorage.removeItem(ONBOARDING_STEP_KEY);
      showSuccess("Setup complete! Welcome to ContentPilot.");
      router.push('/dashboard');
    } catch (error) {
      showError("Failed to complete onboarding. Please try again.");
    }
  };





  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-slate-100 flex items-center px-6 lg:px-12 sticky top-0 bg-white/80 backdrop-blur z-50">
        <div className="flex items-center gap-2 font-display font-bold text-xl tracking-tight text-slate-900">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-lg">CP</div>
          ContentPilot
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Setup Progress
          </div>
          <div className="w-32 lg:w-48">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-2xl">
          {currentStep === 1 && (
            <StepProfile
              initialData={profileData}
              onNext={handleProfileNext}
            />
          )}

          {currentStep === 2 && (
            <StepPillars
              initialPillars={pillars}
              onNext={handlePillarsNext}
            />
          )}

          {currentStep === 3 && (
            <StepVoice
              initialData={voiceData}
              onNext={handleVoiceNext}
              onBack={() => saveProgress(2)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
