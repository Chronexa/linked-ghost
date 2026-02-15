'use client';

import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui';
import { Sparkles, BrainCircuit, PenTool, CheckCircle2, X } from 'lucide-react';

interface GenerationProgressProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isGenerating: boolean;
}

type Step = {
    id: number;
    label: string;
    icon: React.ElementType;
    duration: number; // ms approximation
};

const STEPS: Step[] = [
    { id: 1, label: 'Analyzing your unique voice patterns...', icon: BrainCircuit, duration: 3000 },
    { id: 2, label: 'Reading & understanding topic content...', icon: Sparkles, duration: 3000 },
    { id: 3, label: 'Drafting 3 viral post variants...', icon: PenTool, duration: 6000 },
    { id: 4, label: 'Finalizing & polishing...', icon: CheckCircle2, duration: 3000 },
];

export function GenerationProgress({ open, onOpenChange, isGenerating }: GenerationProgressProps) {
    const [progress, setProgress] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        if (!open || !isGenerating) {
            setProgress(0);
            setCurrentStepIndex(0);
            return;
        }

        const totalDuration = STEPS.reduce((acc, step) => acc + step.duration, 0);
        let elapsed = 0;
        const interval = 100; // Update every 100ms

        const timer = setInterval(() => {
            elapsed += interval;

            // Calculate progress percentage (0-95%, wait for actual completion)
            const percent = Math.min(Math.round((elapsed / totalDuration) * 95), 95);
            setProgress(percent);

            // Determine current step based on elapsed time
            let accumulatedTime = 0;
            let stepIndex = 0;
            for (let i = 0; i < STEPS.length; i++) {
                accumulatedTime += STEPS[i].duration;
                if (elapsed < accumulatedTime) {
                    stepIndex = i;
                    break;
                }
                stepIndex = i; // Clamp to last step if over time
            }
            setCurrentStepIndex(stepIndex);

        }, interval);

        return () => clearInterval(timer);
    }, [open, isGenerating]);

    // Handle completion manually when isGenerating becomes false
    useEffect(() => {
        if (!isGenerating && open) {
            setProgress(100);
            setTimeout(() => onOpenChange(false), 500); // Close after brief delay
        }
    }, [isGenerating, open, onOpenChange]);

    const currentStep = STEPS[currentStepIndex];
    const StepIcon = currentStep?.icon || Sparkles;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 relative animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="font-display text-xl font-bold text-charcoal">
                        Generating Your Post
                    </h2>
                </div>

                <div className="flex flex-col items-center justify-center space-y-6">
                    {/* Icon Animation */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-brand/20 rounded-full animate-ping" />
                        <div className="relative bg-brand/10 p-4 rounded-full">
                            <StepIcon className="w-8 h-8 text-brand animate-pulse" />
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-charcoal-light">
                            <span>{Math.round(progress)}%</span>
                            <span>{Math.ceil((15000 * (100 - progress)) / 100 / 1000)}s remaining</span>
                        </div>
                    </div>

                    {/* Step Text */}
                    <div className="h-12 flex items-center justify-center text-center">
                        {currentStep && (
                            <p className="text-charcoal font-medium animate-in fade-in slide-in-from-bottom-2 duration-300" key={currentStep.id}>
                                {currentStep.label}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
