'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickPostForm, QuickPostFormData } from './QuickPostForm';
import { VariantCard, Variant } from './VariantCard';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface QuickPostModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QuickPostModal({ isOpen, onClose }: QuickPostModalProps) {
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState<'form' | 'results'>('form');
    const [isGenerating, setIsGenerating] = useState(false);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [pillarId, setPillarId] = useState<string | null>(null);
    const [originalIdea, setOriginalIdea] = useState<string>(''); // Store the idea
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    const handleGenerate = async (data: QuickPostFormData) => {
        setIsGenerating(true);
        setPillarId(data.pillarId); // Store for saving later
        setOriginalIdea(data.idea); // Store the idea
        try {
            // Call API
            const res = await apiClient.post('/quick-post/generate', data) as any;

            if (res.data && res.data.variants && res.data.variants.length > 0) {
                setVariants(res.data.variants);
                setStep('results');
                toast.success('Generated 3 variants!');
            } else {
                toast.error('Failed to generate variants. Please try again.');
            }
        } catch (error: any) {
            console.error('Generation error:', error);
            toast.error(error.message || 'Failed to generate post');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSelectVariant = async (variant: Variant) => {
        if (isSaving || !pillarId) return;
        setIsSaving(true);
        setSelectedVariant(variant);

        try {
            // Save draft
            const draft = await apiClient.post('/drafts', {
                content: variant.content,
                hook: variant.hook,
                pillarId: pillarId,
                status: 'draft',
                metadata: {
                    source: 'quick_post',
                    style: variant.style,
                    angle: variant.metadata?.angle,
                    allVariants: variants.map(v => v.content) // Store context
                },
                userPerspective: originalIdea // Pass the original idea as perspective
            }) as any;

            toast.success('Draft saved! Redirecting...');

            // Redirect to editor
            if (draft && draft.data && draft.data.id) {
                router.push('/drafts');
                onClose();
            } else {
                console.error('Invalid draft response:', draft);
                toast.error('Draft saved but response was invalid');
                setIsSaving(false);
            }
        } catch (error: any) {
            console.error('Saving error:', error);
            toast.error('Failed to save draft');
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        setStep('form');
        setVariants([]);
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-background border rounded-lg shadow-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-4">
                        {step === 'results' && (
                            <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        )}
                        <div>
                            <h2 className="text-xl font-semibold">
                                {step === 'form' ? 'Quick Post' : 'Select a Variant'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {step === 'form'
                                    ? 'Turn a quick thought into 3 polished LinkedIn posts.'
                                    : 'Choose the version that best matches your intent.'}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'form' ? (
                        <div className="max-w-xl mx-auto">
                            <QuickPostForm onSubmit={handleGenerate} isGenerating={isGenerating} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                            {variants.map((variant) => (
                                <div key={variant.id} className="h-full">
                                    <VariantCard
                                        variant={variant}
                                        onSelect={handleSelectVariant}
                                        isSaving={isSaving && selectedVariant?.id === variant.id}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
