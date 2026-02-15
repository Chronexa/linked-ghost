import { useState } from 'react';
import { Button, Textarea, Input, Card, CardContent } from '@/components/ui';
import { Plus, Sparkles, X } from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast-utils';
import { useCreateRawTopic } from '@/lib/hooks/use-topics';
import { VALIDATION, VALIDATION_ERRORS } from '@/lib/constants/validation';
import { track } from '@/lib/utils/analytics';

interface AddTopicModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddTopicModal({ open, onOpenChange }: AddTopicModalProps) {
    const [content, setContent] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');

    const createRawTopic = useCreateRawTopic();

    const handleSubmit = async () => {
        if (!content.trim()) {
            showError('Please enter topic content');
            return;
        }

        if (content.trim().length < VALIDATION.TOPIC_CONTENT_MIN) {
            showError(VALIDATION_ERRORS.TOPIC_TOO_SHORT);
            return;
        }

        try {
            await createRawTopic.mutateAsync({
                content: content.trim(),
                sourceUrl: sourceUrl.trim() || undefined,
                source: 'manual',
                status: 'new',
            });

            showSuccess('Topic added successfully!');
            setContent('');
            setSourceUrl('');
            onOpenChange(false);
        } catch (error) {
            showError('Failed to add topic. Please try again.');
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={() => {
                    if (!createRawTopic.isPending) {
                        setContent('');
                        setSourceUrl('');
                        onOpenChange(false);
                    }
                }}
            />

            {/* Modal */}
            <Card className="relative z-10 w-full max-w-xl shadow-xl animate-in zoom-in-95 duration-200">
                <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-brand" />
                            <h2 className="font-display text-xl font-bold text-slate-900">
                                Add Topic Manually
                            </h2>
                        </div>
                        <button
                            onClick={() => {
                                if (!createRawTopic.isPending) {
                                    setContent('');
                                    setSourceUrl('');
                                    onOpenChange(false);
                                }
                            }}
                            disabled={createRawTopic.isPending}
                            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Close dialog"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                Topic / Headline
                            </label>
                            <Textarea
                                value={content}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Enforce max length client-side
                                    if (value.length <= VALIDATION.TOPIC_CONTENT_MAX) {
                                        setContent(value);
                                    }
                                }}
                                maxLength={VALIDATION.TOPIC_CONTENT_MAX}
                                placeholder="Example: Goldman Sachs just launched an AI advisor for wealth management. This could change how NRIs manage their US-India portfolios..."
                                rows={6}
                                className="resize-none"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                {content.length}/{VALIDATION.TOPIC_CONTENT_MAX} characters {content.length >= VALIDATION.TOPIC_CONTENT_MIN && '✓'}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                Source URL (Optional)
                            </label>
                            <Input
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                                placeholder="https://example.com/article"
                                type="url"
                            />
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <Sparkles className="h-4 w-4 text-brand mt-0.5" />
                                <p className="text-xs text-slate-600">
                                    <strong>Tip:</strong> Paste news headlines, Reddit discussions, or industry updates you want to write about. We&apos;ll help you turn them into engaging LinkedIn posts.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-3 mt-6">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                if (!createRawTopic.isPending) {
                                    setContent('');
                                    setSourceUrl('');
                                    onOpenChange(false);
                                }
                            }}
                            disabled={createRawTopic.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={content.length < VALIDATION.TOPIC_CONTENT_MIN || createRawTopic.isPending}
                            isLoading={createRawTopic.isPending}
                            loadingText="Adding..."
                        >
                            Add Topic
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
