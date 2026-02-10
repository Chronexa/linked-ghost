'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, Input, Textarea } from '@/components/ui';

const steps = [
  { id: 1, name: 'Welcome', icon: '👋' },
  { id: 2, name: 'Content Pillars', icon: '🎯' },
  { id: 3, name: 'Voice Training', icon: '✍️' },
  { id: 4, name: 'Connect Sources', icon: '🔗' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [pillars, setPillars] = useState<string[]>(['', '', '']);
  const [voiceExamples, setVoiceExamples] = useState<string[]>(['', '', '']);
  const [sources, setSources] = useState({
    perplexity: false,
    reddit: false,
    redditKeywords: '',
    manualOnly: true,
  });

  const handleAddPillar = () => setPillars([...pillars, '']);
  const handleRemovePillar = (index: number) => {
    setPillars(pillars.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  const isStepComplete = () => {
    if (currentStep === 2) {
      return pillars.filter((p) => p.trim()).length >= 3;
    }
    if (currentStep === 3) {
      return voiceExamples.filter((v) => v.trim().length >= 100).length >= 3;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                    currentStep >= step.id
                      ? 'bg-brand text-white'
                      : 'bg-border text-charcoal-light'
                  }`}
                >
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition ${
                      currentStep > step.id ? 'bg-brand' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs">
            {steps.map((step) => (
              <span
                key={step.id}
                className={`font-medium ${
                  currentStep >= step.id ? 'text-brand' : 'text-charcoal-light'
                }`}
              >
                {step.name}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-card-hover">
          <CardContent className="p-8">
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl">👋</span>
                </div>
                <h1 className="font-display text-4xl font-bold text-charcoal mb-4">
                  Welcome to ContentPilot AI
                </h1>
                <p className="text-charcoal-light text-lg leading-relaxed max-w-xl mx-auto mb-8">
                  Let&apos;s set up your AI content assistant. This will take about 3-5 minutes and help us
                  create posts that sound authentically you.
                </p>
                <div className="inline-block p-4 bg-brand/5 rounded-lg border border-brand/20 mb-8">
                  <p className="text-sm text-charcoal-light">
                    <span className="font-semibold text-brand-text">💡 Quick tip:</span> The more effort you put into
                    this setup, the better your posts will be. It&apos;s worth it!
                  </p>
                </div>
                <Button size="lg" onClick={() => setCurrentStep(2)}>
                  Get Started →
                </Button>
              </div>
            )}

            {/* Step 2: Content Pillars */}
            {currentStep === 2 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-charcoal mb-3">
                  Define Your Content Pillars
                </h2>
                <p className="text-charcoal-light mb-6">
                  Add 3-5 content themes you want to post about. These help organize your content and keep
                  your LinkedIn presence focused.
                </p>

                <div className="space-y-3 mb-6">
                  {pillars.map((pillar, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="text"
                        value={pillar}
                        onChange={(e) => {
                          const newPillars = [...pillars];
                          newPillars[index] = e.target.value;
                          setPillars(newPillars);
                        }}
                        placeholder={`Pillar ${index + 1} (e.g., AI Innovation, Founder Journey)`}
                      />
                      {pillars.length > 3 && (
                        <button
                          onClick={() => handleRemovePillar(index)}
                          className="p-2 text-error hover:bg-error/5 rounded transition"
                          aria-label="Remove pillar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {pillars.length < 5 && (
                  <Button variant="secondary" size="sm" onClick={handleAddPillar}>
                    + Add Another Pillar
                  </Button>
                )}

                <div className="mt-6 p-4 bg-background rounded-lg">
                  <p className="text-sm text-charcoal-light">
                    <span className="font-semibold text-charcoal">Examples:</span> AI Innovation, Leadership
                    Insights, Founder Journey, Productivity Hacks, Industry Trends
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Voice Training */}
            {currentStep === 3 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-charcoal mb-3">
                  Train Your Voice
                </h2>
                <p className="text-charcoal-light mb-6">
                  Paste 3-5 of your best LinkedIn posts so our AI can learn your unique writing style, tone,
                  and personality.
                </p>

                <div className="space-y-4">
                  {voiceExamples.map((example, index) => (
                    <Textarea
                      key={index}
                      label={`Example ${index + 1}`}
                      value={example}
                      onChange={(e) => {
                        const newExamples = [...voiceExamples];
                        newExamples[index] = e.target.value;
                        setVoiceExamples(newExamples);
                      }}
                      placeholder="Paste a LinkedIn post that represents your writing style..."
                      rows={4}
                      helperText={
                        example.length > 0
                          ? `${example.length} characters ${
                              example.length >= 100 ? '✓' : '(min 100)'
                            }`
                          : ''
                      }
                    />
                  ))}
                </div>

                <div className="mt-6 p-4 bg-brand/5 rounded-lg border border-brand/20">
                  <p className="text-sm text-charcoal-light">
                    <span className="font-semibold text-brand-text">💡 Pro tip:</span> Choose posts with
                    different styles and lengths. This helps AI capture your full range.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Connect Sources */}
            {currentStep === 4 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-charcoal mb-3">
                  Connect Content Sources
                </h2>
                <p className="text-charcoal-light mb-6">
                  Choose where ContentPilot AI should find content inspiration. You can always change this
                  later.
                </p>

                <div className="space-y-4">
                  {/* Perplexity */}
                  <label className="flex items-start p-4 bg-background rounded-lg cursor-pointer hover:bg-border/20 transition">
                    <input
                      type="checkbox"
                      checked={sources.perplexity}
                      onChange={(e) => setSources({ ...sources, perplexity: e.target.checked })}
                      className="w-5 h-5 text-brand rounded mt-0.5 accent-brand"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-semibold text-charcoal">Perplexity AI (Recommended)</p>
                      <p className="text-sm text-charcoal-light mt-1">
                        Automatically discover trending news and insights in your industry
                      </p>
                    </div>
                  </label>

                  {/* Reddit */}
                  <div className="p-4 bg-background rounded-lg">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sources.reddit}
                        onChange={(e) => setSources({ ...sources, reddit: e.target.checked })}
                        className="w-5 h-5 text-brand rounded mt-0.5 accent-brand"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-semibold text-charcoal">Reddit</p>
                        <p className="text-sm text-charcoal-light mt-1">
                          Monitor Reddit discussions by keywords
                        </p>
                      </div>
                    </label>
                    {sources.reddit && (
                      <div className="mt-3 ml-8">
                        <Input
                          type="text"
                          value={sources.redditKeywords}
                          onChange={(e) =>
                            setSources({ ...sources, redditKeywords: e.target.value })
                          }
                          placeholder="e.g., AI, startups, productivity"
                          helperText="Enter keywords separated by commas"
                        />
                      </div>
                    )}
                  </div>

                  {/* Manual Only */}
                  <label className="flex items-start p-4 bg-background rounded-lg cursor-pointer hover:bg-border/20 transition">
                    <input
                      type="checkbox"
                      checked={sources.manualOnly}
                      onChange={(e) => setSources({ ...sources, manualOnly: e.target.checked })}
                      className="w-5 h-5 text-brand rounded mt-0.5 accent-brand"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-semibold text-charcoal">Manual Input Only</p>
                      <p className="text-sm text-charcoal-light mt-1">
                        Add topics manually when you find interesting content
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-border">
              {currentStep > 1 && (
                <Button variant="secondary" onClick={() => setCurrentStep(currentStep - 1)}>
                  ← Back
                </Button>
              )}
              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!isStepComplete()}
                  className="ml-auto"
                >
                  Next Step →
                </Button>
              ) : (
                <Button onClick={handleFinish} variant="success" size="lg" className="ml-auto">
                  Complete Setup 🎉
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
