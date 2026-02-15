import { useState, useEffect, useRef } from 'react';
import { Button, Textarea, Card, CardContent } from '@/components/ui';
import { Sparkles, X, Lightbulb, Brain, ChevronDown } from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast-utils';
import { useGenerateDrafts } from '@/lib/hooks/use-topics';
import { usePillars } from '@/lib/hooks/use-pillars';
import { useProfile } from '@/lib/hooks/use-profile';
import { VALIDATION, VALIDATION_ERRORS } from '@/lib/constants/validation';
import { sanitizeUrl } from '@/lib/utils/url-validation';
import type { Pillar, ClassifiedTopic } from '@/lib/types/domain';
import { track } from '@/lib/utils/analytics';

interface WritePostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    topic: {
        id: string;
        content: string;
        sourceUrl?: string;
        pillarId?: string;
        pillarName?: string;
    } | null;
}

export function WritePostModal({ open, onOpenChange, topic }: WritePostModalProps) {
    const [userPerspective, setUserPerspective] = useState('');
    const [selectedPillarId, setSelectedPillarId] = useState<string>('');

    // Track previous open state to detect transitions
    const prevOpenRef = useRef(open);
    const prevTopicIdRef = useRef(topic?.id);

    const { data: pillarsData, error: pillarsError, isLoading: pillarsLoading } = usePillars();
    const { data: profileResponse } = useProfile();
    const profile = profileResponse?.data;
    const generateDrafts = useGenerateDrafts();

    // Only reset when modal opens from closed state OR when topic changes while modal is closed
    useEffect(() => {
        const wasOpen = prevOpenRef.current;
        const isOpening = open && !wasOpen;
        const topicChanged = topic?.id !== prevTopicIdRef.current;

        if (isOpening || (topicChanged && !open)) {
            // Reset form only when opening or when topic changes while closed
            setSelectedPillarId(topic?.pillarId || '');
            setUserPerspective('');
        }

        // Update refs for next render
        prevOpenRef.current = open;
        prevTopicIdRef.current = topic?.id;
    }, [open, topic?.id, topic?.pillarId]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            setUserPerspective('');
            setSelectedPillarId('');
        };
    }, []);

    const handleSubmit = async () => {
        if (!topic) return;

        if (!userPerspective.trim()) {
            showError('Please share your perspective on this topic');
            return;
        }

        if (userPerspective.trim().length < VALIDATION.PERSPECTIVE_MIN) {
            showError(VALIDATION_ERRORS.PERSPECTIVE_TOO_SHORT);
            return;
        }

        if (!selectedPillarId) {
            showError('Please select a content pillar');
            return;
        }

        try {
            await generateDrafts.mutateAsync({
                topicId: topic.id,
                userPerspective: userPerspective.trim(),
                pillarId: selectedPillarId,
            });

            // API now returns 202 Accepted for async generation
            showSuccess('Draft generation started in background. We\'ll notify you when it\'s ready.');
            setUserPerspective('');
            onOpenChange(false);
        } catch (error) {
            showError('Failed to start draft generation. Please try again.');
        }
    };

    if (!open || !topic) return null;

    const pillars = pillarsData?.data || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={() => {
                    if (!generateDrafts.isPending) {
                        setUserPerspective('');
                        onOpenChange(false);
                    }
                }}
            />

            {/* Modal */}
            <Card className="relative z-10 w-full max-w-2xl shadow-xl animate-in zoom-in-95 duration-200">
                <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-brand" />
                            <h2 className="font-display text-xl font-bold text-slate-900">
                                Write Your Post
                            </h2>
                        </div>
                        <button
                            onClick={() => {
                                if (!generateDrafts.isPending) {
                                    setUserPerspective('');
                                    onOpenChange(false);
                                }
                            }}
                            disabled={generateDrafts.isPending}
                            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Close dialog"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Topic Context */}
                    <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-brand mt-1 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 mb-1">Topic</p>
                                <p className="text-sm text-slate-900 leading-relaxed">{topic.content}</p>
                                {(() => {
                                    const safeUrl = sanitizeUrl(topic.sourceUrl);
                                    return safeUrl ? (
                                        <a
                                            href={safeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-brand hover:underline mt-2 inline-block"
                                        >
                                            View Source →
                                        </a>
                                    ) : null;
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* AI Context Preview (New Phase 5 Feature) */}
                    {profile && (profile.industry || profile.currentRole) && (
                        <details className="mb-6 group border border-indigo-100 rounded-lg overflow-hidden">
                            <summary className="flex items-center gap-2 cursor-pointer p-3 bg-indigo-50/50 hover:bg-indigo-50 transition-colors list-none select-none">
                                <Brain className="h-4 w-4 text-indigo-600" />
                                <span className="text-sm font-medium text-indigo-900">AI Context Active</span>
                                <ChevronDown className="h-4 w-4 text-indigo-400 group-open:rotate-180 transition-transform ml-auto" />
                            </summary>
                            <div className="p-4 pt-2 bg-white text-sm space-y-2 text-slate-600 animate-in slide-in-from-top-2 border-t border-indigo-50">
                                <div className="flex gap-2">
                                    <span className="font-medium text-slate-900 min-w-[70px]">Identity:</span>
                                    <span>{profile.currentRole || 'Professional'} {profile.industry ? `in ${profile.industry}` : ''}</span>
                                </div>
                                {profile.keyExpertise && Array.isArray(profile.keyExpertise) && profile.keyExpertise.length > 0 && (
                                    <div className="flex gap-2">
                                        <span className="font-medium text-slate-900 min-w-[70px]">Expertise:</span>
                                        <span>{profile.keyExpertise.slice(0, 3).join(', ')}</span>
                                    </div>
                                )}
                                <p className="text-xs text-slate-400 mt-2 italic">
                                    * The AI uses this context to write with your specific authority and terminology.
                                </p>
                            </div>
                        </details>
                    )}

                    {/* Form */}
                    <div className="space-y-4">
                        {/* Pillar Selection */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                Content Pillar
                            </label>

                            {pillarsError && (
                                <div className="mb-2 bg-red-50 border border-red-200 rounded-lg p-2">
                                    <p className="text-sm text-red-700">
                                        Failed to load pillars. Please refresh the page.
                                    </p>
                                </div>
                            )}

                            {pillarsLoading && (
                                <div className="mb-2 text-sm text-slate-500">
                                    Loading pillars...
                                </div>
                            )}

                            {!pillarsLoading && !pillarsError && pillars.length === 0 && (
                                <div className="mb-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                                    <p className="text-sm text-yellow-700">
                                        No content pillars found. Please create one in Settings first.
                                    </p>
                                </div>
                            )}

                            <select
                                value={selectedPillarId}
                                onChange={(e) => setSelectedPillarId(e.target.value)}
                                disabled={pillarsLoading || !!pillarsError || pillars.length === 0}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                            >
                                <option value="">Select a pillar...</option>
                                {pillars.map((pillar: Pillar) => (
                                    <option key={pillar.id} value={pillar.id}>
                                        {pillar.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* User Perspective */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                What&apos;s your take on this?
                            </label>
                            <Textarea
                                value={userPerspective}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Enforce max length client-side
                                    if (value.length <= VALIDATION.PERSPECTIVE_MAX) {
                                        setUserPerspective(value);
                                    }
                                }}
                                maxLength={VALIDATION.PERSPECTIVE_MAX}
                                placeholder="Share your perspective, insights, or angle on this topic. This helps the AI write in your voice and capture your unique point of view..."
                                rows={6}
                                className="resize-none"
                            />
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-slate-500">
                                    {userPerspective.length}/{VALIDATION.PERSPECTIVE_MAX} characters {userPerspective.length >= VALIDATION.PERSPECTIVE_MIN && '✓'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    Min {VALIDATION.PERSPECTIVE_MIN} characters required
                                </p>
                            </div>
                        </div>

                        {/* Tip */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-medium text-blue-900 mb-1">
                                        Writing Tip
                                    </p>
                                    <p className="text-xs text-blue-700">
                                        Be specific about your angle. Instead of &quot;This is interesting,&quot; try &quot;This reminds me of when I...&quot; or &quot;The key insight here is...&quot;
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-3 mt-6">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                if (!generateDrafts.isPending) {
                                    setUserPerspective('');
                                    onOpenChange(false);
                                }
                            }}
                            disabled={generateDrafts.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={userPerspective.length < VALIDATION.PERSPECTIVE_MIN || !selectedPillarId || generateDrafts.isPending}
                            isLoading={generateDrafts.isPending}
                            loadingText="Generating..."
                            className="gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            Generate Post
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
