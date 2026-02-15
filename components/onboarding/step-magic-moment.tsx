import { useState, useEffect, useRef } from 'react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { showSuccess, showError, showLoading, dismissToast } from '@/lib/toast-utils';
import { generateMockPost, GeneratedPost } from '@/lib/mock-content-generator';
import { Sparkles, Copy, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { VoiceData } from './step-voice';

interface StepMagicMomentProps {
    pillars: string[];
    voiceData: VoiceData;
    onComplete: (generatedPost: GeneratedPost) => void;
}

export function StepMagicMoment({ pillars, voiceData, onComplete }: StepMagicMomentProps) {
    const [phase, setPhase] = useState<'discovery' | 'generation' | 'results'>('discovery');
    const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const initialized = useRef(false);

    // Auto-start generation on mount
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const runMagic = async () => {
            // 1. Discovery Phase (2s)
            setPhase('discovery');
            await new Promise(r => setTimeout(r, 2000));

            // 2. Generation Phase (3s)
            setPhase('generation');
            // Generate content in background while showing loading state
            const pillar = pillars[0] || "Founder Journey";
            const result = generateMockPost(pillar, !!voiceData.primarySample);
            setGeneratedPost(result);

            await new Promise(r => setTimeout(r, 2500));

            // 3. Results Phase
            setPhase('results');
            showSuccess("3 posts generated!");
        };

        runMagic();
    }, [pillars, voiceData]);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            showSuccess("Copied to clipboard!");
            setTimeout(() => setCopiedId(null), 2000);
        }).catch(() => {
            showError("Failed to copy");
        });
    };

    const handleFinish = () => {
        if (generatedPost) {
            onComplete(generatedPost);
        }
    };

    if (phase === 'discovery' || phase === 'generation') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 animate-in fade-in duration-700">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                </div>

                <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
                    {phase === 'discovery' ? `Finding trending topics in ${pillars[0]}...` : 'Drafting 3 variants in your voice...'}
                </h2>

                <p className="text-slate-500 max-w-md mx-auto">
                    {phase === 'discovery'
                        ? "Scanning top performing content from the last 24 hours."
                        : "Reviewing your voice samples to match tone and style."}
                </p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
                    Your First Post is Ready! ✨
                </h1>
                <p className="text-slate-600">
                    We found a trending topic and drafted 3 angles for you.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {generatedPost?.variants.map((variant) => (
                    <Card key={variant.id} className="border-slate-200 hover:border-blue-300 transition-colors flex flex-col">
                        <CardContent className="p-5 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-3">
                                <Badge variant="neutral" className="bg-slate-100 text-slate-600 border-slate-200">
                                    Option {variant.letter}
                                </Badge>
                                <span className="text-xs text-slate-400 font-mono">
                                    {variant.characterCount}c
                                </span>
                            </div>

                            <h4 className="font-medium text-slate-900 text-sm mb-2">
                                {variant.angle}
                            </h4>

                            <p className="text-slate-600 text-sm whitespace-pre-wrap flex-grow mb-4 leading-relaxed line-clamp-[8]">
                                {variant.text}
                            </p>

                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full mt-auto gap-2"
                                onClick={() => handleCopy(variant.text, variant.id)}
                            >
                                {copiedId === variant.id ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copiedId === variant.id ? "Copied" : "Copy Text"}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center">
                <Button
                    size="lg"
                    onClick={handleFinish}
                    className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                    Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
