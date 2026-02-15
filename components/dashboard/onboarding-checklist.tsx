'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Progress } from '@/components/ui';
import { X, CheckCircle2, Circle } from 'lucide-react';
import { useUser } from '@/lib/hooks/use-user';

interface ChecklistItem {
    id: string;
    label: string;
    completed: boolean;
    optional?: boolean;
}

export function OnboardingChecklist() {
    const { data: userProfile } = useUser();
    const [dismissed, setDismissed] = useState(false);

    if (!userProfile?.data || dismissed) return null;

    const profile = userProfile.data.profile;

    // Calculate checklist items
    const items: ChecklistItem[] = [
        {
            id: 'goal',
            label: 'Content goal set',
            completed: !!profile?.contentGoal,
        },
        {
            id: 'audience',
            label: 'Target audience defined',
            completed: !!profile?.targetAudience && profile.targetAudience.length >= 100,
        },
        {
            id: 'pillars',
            label: 'Topics selected',
            completed: (userProfile.data.pillars?.length || 0) > 0,
        },
        {
            id: 'voice',
            label: 'Voice trained',
            completed: (userProfile.data.voiceExamples?.length || 0) > 0,
        },
        {
            id: 'first-post',
            label: 'First post generated',
            completed: (userProfile.data.stats?.generatedPosts || 0) > 0,
        },
        {
            id: 'linkedin-url',
            label: 'LinkedIn URL added',
            completed: !!profile?.linkedinUrl,
        },
        {
            id: 'more-voice',
            label: 'Add 2+ more voice examples',
            completed: (userProfile.data.voiceExamples?.length || 0) >= 3,
            optional: true,
        },
    ];

    const requiredItems = items.filter(item => !item.optional);
    const completedRequired = requiredItems.filter(item => item.completed).length;
    const completionPercent = Math.round((completedRequired / requiredItems.length) * 100);

    // Only show if less than 70% complete AND within first 7 days
    const shouldShow = completionPercent < 70;
    if (!shouldShow) return null;

    return (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 mb-6">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900 text-lg">
                                🎯 Complete Your Setup
                            </h3>
                            <span className="text-sm font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                {completionPercent}% Done
                            </span>
                        </div>
                        <Progress value={completionPercent} className="h-2 mb-4" />
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-slate-400 hover:text-slate-600 transition-colors ml-4"
                        aria-label="Dismiss"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Checklist Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-2 text-sm ${item.completed ? 'text-slate-600' : 'text-slate-500'
                                }`}
                        >
                            {item.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                                <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                            )}
                            <span className={item.completed ? 'line-through' : ''}>
                                {item.label}
                                {item.optional && (
                                    <span className="text-xs text-slate-400 ml-1">(optional)</span>
                                )}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        size="sm"
                        onClick={() => {
                            window.location.href = '/profile';
                        }}
                    >
                        Complete Setup
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setDismissed(true)}
                    >
                        I&apos;ll do this later
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
