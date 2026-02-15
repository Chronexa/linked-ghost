import { useState } from 'react';
import { Button, Input, Textarea, Card, CardContent } from '@/components/ui';
import { showSuccess, showLoading, dismissToast } from '@/lib/toast-utils';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronRight, Mic, Wand2 } from 'lucide-react';

export interface VoiceData {
    primarySample: string;
    additionalSamples?: string[];
    useDefaultVoice?: boolean;
}

interface StepVoiceProps {
    initialData?: VoiceData;
    onNext: (data: VoiceData) => void;
    onBack: () => void;
}

export function StepVoice({ initialData, onNext, onBack }: StepVoiceProps) {
    const [primarySample, setPrimarySample] = useState(initialData?.primarySample || '');
    const [additionalSamples, setAdditionalSamples] = useState<string[]>(
        initialData?.additionalSamples || ['', '']
    );
    const [isanalyzing, setIsAnalyzing] = useState(false);
    const [showAdditional, setShowAdditional] = useState(false);

    // Analysis simulation state
    const [analysisStep, setAnalysisStep] = useState(0); // 0: Idle, 1: Reading, 2: Emoji, 3: Voice Profile, 4: Done

    const handleExtraSampleChange = (index: number, value: string) => {
        const newSamples = [...additionalSamples];
        newSamples[index] = value;
        setAdditionalSamples(newSamples);
    };

    const handleAnalyzeAndNext = async () => {
        if (!primarySample.trim()) return;

        setIsAnalyzing(true);
        setAnalysisStep(1); // Reading posts...

        // Simulate analysis steps
        setTimeout(() => setAnalysisStep(2), 1500); // Detecting emoji...
        setTimeout(() => setAnalysisStep(3), 3000); // Building profile...

        setTimeout(() => {
            setAnalysisStep(4);
            setIsAnalyzing(false);
            showSuccess("Voice profile created!");

            onNext({
                primarySample,
                additionalSamples: additionalSamples.filter(s => s.trim().length > 0),
                useDefaultVoice: false
            });
        }, 4500);
    };

    const handleSkip = () => {
        onNext({
            primarySample: '',
            useDefaultVoice: true
        });
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
                    Teach the AI to write like you
                </h1>
                <p className="text-slate-600">
                    Paste a recent LinkedIn post so we can match your tone.
                </p>
            </div>

            <Card className="border-slate-200 shadow-sm relative overflow-hidden">
                {/* Analysis Overlay */}
                {isanalyzing && (
                    <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Wand2 className="w-8 h-8 text-blue-600" />
                        </div>

                        <h3 className="font-display text-2xl font-bold text-slate-900 mb-2 transition-all duration-300">
                            {analysisStep === 1 && "Reading your post..."}
                            {analysisStep === 2 && "Detecting emoji patterns..."}
                            {analysisStep === 3 && "Building voice profile..."}
                        </h3>

                        <p className="text-slate-500 max-w-sm">
                            We&apos;re analyzing sentence structure, vocabulary, and formatting to create your digital twin.
                        </p>

                        <div className="w-64 h-2 bg-slate-100 rounded-full mt-8 overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                                style={{ width: `${analysisStep * 33}%` }}
                            />
                        </div>
                    </div>
                )}

                <CardContent className="p-6 space-y-6">
                    {/* Primary Input */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 flex justify-between">
                            <span>Your Best Post (Required)</span>
                            <span className="text-xs text-slate-400 font-normal">Min 50 chars</span>
                        </label>
                        <Textarea
                            value={primarySample}
                            onChange={(e) => setPrimarySample(e.target.value)}
                            placeholder="Paste a recent LinkedIn post you've written (at least 50 characters). We use this to analyze your tone and style."
                            className="min-h-[150px]"
                        />
                    </div>

                    {/* Collapsible Additional Inputs */}
                    <CollapsiblePrimitive.Root open={showAdditional} onOpenChange={setShowAdditional}>
                        <CollapsiblePrimitive.Trigger asChild>
                            <button className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                {showAdditional ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                                + Add 2 more samples for 90% accuracy
                            </button>
                        </CollapsiblePrimitive.Trigger>

                        <CollapsiblePrimitive.Content className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                                <p className="text-xs text-slate-500 mb-2">More samples help the AI understand your nuace.</p>
                                <Textarea
                                    value={additionalSamples[0]}
                                    onChange={(e) => handleExtraSampleChange(0, e.target.value)}
                                    placeholder="Paste another post..."
                                    className="min-h-[100px] bg-white"
                                />
                                <Textarea
                                    value={additionalSamples[1]}
                                    onChange={(e) => handleExtraSampleChange(1, e.target.value)}
                                    placeholder="And one more..."
                                    className="min-h-[100px] bg-white"
                                />
                            </div>
                        </CollapsiblePrimitive.Content>
                    </CollapsiblePrimitive.Root>

                    <div className="pt-4 flex flex-col gap-3">
                        <Button
                            size="lg"
                            className="w-full relative overflow-hidden"
                            onClick={handleAnalyzeAndNext}
                            disabled={primarySample.length < 50}
                        >
                            Analyze My Voice & Continue
                        </Button>

                        <div className="text-center">
                            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">OR</span>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-slate-500 hover:text-slate-900"
                            onClick={handleSkip}
                        >
                            Use Professional Default Voice
                        </Button>
                    </div>

                    <div className="text-center">
                        <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600">
                            ← Back to Pillars
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
