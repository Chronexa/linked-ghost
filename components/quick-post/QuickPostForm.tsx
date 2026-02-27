'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select-custom';
import { RadioCard } from '@/components/ui/radio-card';
import { usePillars } from '@/lib/hooks/use-pillars';
import { Loader2, Sparkles, Lightbulb, BookOpen, MessageCircle, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface QuickPostFormData {
    idea: string;
    pillarId: string;
    angle: 'story' | 'insight' | 'opinion' | 'howto';
    additionalContext: string;
}

interface QuickPostFormProps {
    onSubmit: (data: QuickPostFormData) => Promise<void>;
    isGenerating: boolean;
}

export function QuickPostForm({ onSubmit, isGenerating }: QuickPostFormProps) {
    const { data: pillars, isLoading: pillarsLoading } = usePillars({ status: 'active' });
    const activePillars = pillars?.data || [];

    const [formState, setFormState] = useState<QuickPostFormData>({
        idea: '',
        pillarId: '',
        angle: 'insight', // Default
        additionalContext: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formState.idea || formState.idea.length < 10) {
            toast.error('Please enter at least 10 characters for your idea.');
            return;
        }
        if (!formState.pillarId) {
            toast.error('Please select a content pillar.');
            return;
        }

        await onSubmit(formState);
    };

    const pillarOptions = activePillars.map((p: any) => ({
        label: p.name,
        value: p.id
    }));

    const angles = [
        { id: 'insight', label: 'Insight', icon: Lightbulb, desc: 'Share a realization' },
        { id: 'story', label: 'Story', icon: BookOpen, desc: 'Tell a personal anecdote' },
        { id: 'opinion', label: 'Opinion', icon: MessageCircle, desc: 'Take a stance' },
        { id: 'howto', label: 'How-To', icon: Wrench, desc: 'Teach a skill' }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Idea Input */}
            <div className="space-y-2">
                <Label htmlFor="idea" className="text-base font-semibold">
                    What&apos;s on your mind? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="idea"
                    placeholder="e.g. AI is changing how we code, making developers more like architects..."
                    className="min-h-[100px] resize-none text-lg"
                    value={formState.idea}
                    onChange={(e) => setFormState(prev => ({ ...prev, idea: e.target.value }))}
                    disabled={isGenerating}
                    autoFocus
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Content Pillar Selection */}
                <div className="space-y-2">
                    <Label htmlFor="pillar">Content Pillar <span className="text-red-500">*</span></Label>
                    <Select
                        value={formState.pillarId}
                        onChange={(value) => setFormState(prev => ({ ...prev, pillarId: value }))}
                        options={pillarOptions}
                        placeholder={pillarsLoading ? "Loading pillars..." : "Select a pillar"}
                        className="w-full"
                    />
                    {activePillars.length === 0 && !pillarsLoading && (
                        <p className="text-xs text-yellow-600">No active pillars found. Please create one first.</p>
                    )}
                </div>

                {/* Additional Context (Optional) */}
                <div className="space-y-2">
                    <Label htmlFor="context" className="text-sm text-muted-foreground">
                        Additional Context (Optional)
                    </Label>
                    <Textarea
                        id="context"
                        placeholder="Specific tone, keywords, or CTA?"
                        className="min-h-[42px] resize-none"
                        value={formState.additionalContext}
                        onChange={(e) => setFormState(prev => ({ ...prev, additionalContext: e.target.value }))}
                        disabled={isGenerating}
                    />
                </div>
            </div>

            {/* Angle Selection */}
            <div className="space-y-2">
                <Label>Angle / Perspective</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {angles.map((angle) => (
                        <RadioCard
                            key={angle.id}
                            label={angle.label}
                            // description={angle.desc} // Optional: hide desc to save space if needed
                            checked={formState.angle === angle.id}
                            onChange={() => !isGenerating && setFormState(prev => ({ ...prev, angle: angle.id as any }))}
                            className={cn("h-full", isGenerating && "opacity-50 cursor-not-allowed")}
                            icon={<angle.icon className="w-4 h-4" />}
                        />
                    ))}
                </div>
            </div>

            {/* Submit Action */}
            <Button
                type="submit"
                size="lg"
                className="w-full text-lg h-12 gap-2 mt-4"
                disabled={isGenerating || pillarsLoading || activePillars.length === 0}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Variants...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        Generate 3 Variants
                    </>
                )}
            </Button>
        </form>
    );
}
