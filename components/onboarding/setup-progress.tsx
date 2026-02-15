'use client';

import { useProfile } from '@/lib/hooks/use-profile';
import { usePillars } from '@/lib/hooks/use-pillars';
import { useVoiceExamples } from '@/lib/hooks/use-voice';
import { Progress, Card, CardContent } from '@/components/ui';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function SetupProgress() {
    const { data: profile } = useProfile();
    const { data: pillars } = usePillars();
    const { data: examples } = useVoiceExamples();

    // Checks
    const hasProfile = !!(profile as any)?.data?.linkedinHeadline && !!(profile as any)?.data?.linkedinSummary;
    const hasPillars = ((pillars as any)?.data?.length || 0) > 0;
    const hasVoice = ((examples as any)?.data?.length || 0) >= 3;

    // Calculate Progress
    const steps = [
        { label: 'Profile Setup', done: hasProfile, link: '/profile', icon: '👤' },
        { label: 'Define 1+ Pillar', done: hasPillars, link: '/settings', icon: '🏛️' },
        { label: 'Add 3+ Voice Examples', done: hasVoice, link: '/settings', icon: '🎙️' },
    ];

    const completedCount = steps.filter(s => s.done).length;
    const total = steps.length;
    const progress = (completedCount / total) * 100;

    if (completedCount === total) return null; // Hide when done!

    return (
        <div className="px-4 py-4">
            <Card className="bg-muted/30 border-dashed border-brand/20 shadow-none overflow-hidden">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <span className="text-brand">🚀</span> Setup Strength
                        </h4>
                        <span className="text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
                    </div>

                    {/* Standard Progress without custom indicator class for now to match UI lib */}
                    <Progress value={progress} className="h-1.5 bg-muted" />

                    <div className="space-y-2 pt-1">
                        {steps.map((step, i) => (
                            <Link key={i} href={step.link} className={cn(
                                "flex items-center justify-between text-xs group p-1.5 rounded hover:bg-muted transition-colors",
                                step.done ? "text-muted-foreground opacity-60" : "text-foreground font-medium"
                            )}>
                                <div className="flex items-center gap-2">
                                    {step.done ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
                                    ) : (
                                        <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />
                                    )}
                                    <span>{step.label}</span>
                                </div>
                                {!step.done && <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand" />}
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
