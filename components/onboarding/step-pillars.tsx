import { useState } from 'react';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { showSuccess, showError } from '@/lib/toast-utils';

interface StepPillarsProps {
    initialPillars: string[];
    onNext: (pillars: string[]) => void;
}

const SUGGESTED_PILLARS = [
    "Founder Journey", "SaaS Growth", "AI Trends",
    "Remote Leadership", "Product Management", "Marketing Psychology"
];

export function StepPillars({ initialPillars, onNext }: StepPillarsProps) {
    // Initialize with at least one empty string if empty, or use passed pillars
    const [pillars, setPillars] = useState<string[]>(
        initialPillars.length > 0 ? initialPillars : []
    );
    const [customPillar, setCustomPillar] = useState('');

    const togglePillar = (pillar: string) => {
        if (pillars.includes(pillar)) {
            setPillars(pillars.filter(p => p !== pillar));
        } else {
            if (pillars.length >= 3) {
                showError("Focus on 1-3 core topics");
                return;
            }
            setPillars([...pillars, pillar]);
        }
    };

    const addCustomPillar = () => {
        if (!customPillar.trim()) return;
        if (pillars.includes(customPillar.trim())) {
            showError("This pillar is already selected");
            return;
        }
        if (pillars.length >= 3) {
            showError("Focus on 1-3 core topics");
            return;
        }
        setPillars([...pillars, customPillar.trim()]);
        setCustomPillar('');
    };

    const handleNext = () => {
        if (pillars.length === 0) {
            showError("Please select at least 1 pillar");
            return;
        }
        if (pillars.length > 3) {
            showError("Focus on 1-3 core topics");
            return;
        }
        onNext(pillars);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
                    What do you want to be known for?
                </h1>
                <p className="text-slate-600">
                    Select 1-3 topics. The AI will hunt for news in these niches every morning.
                </p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-6">
                    {/* Smart Suggestions */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-3 block">
                            Popular Topics
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTED_PILLARS.map((pillar) => (
                                <button
                                    key={pillar}
                                    onClick={() => togglePillar(pillar)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${pillars.includes(pillar)
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                        }`}
                                >
                                    {pillar} {pillars.includes(pillar) && '✓'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Input */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-3 block">
                            Add Custom Topic
                        </label>
                        <div className="flex gap-2">
                            <Input
                                value={customPillar}
                                onChange={(e) => setCustomPillar(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCustomPillar()}
                                placeholder="e.g. Bootstrapping"
                                className="flex-1"
                            />
                            <Button
                                variant="secondary"
                                onClick={addCustomPillar}
                                disabled={!customPillar.trim()}
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    {/* Selected Pillars Summary */}
                    {pillars.length > 0 && (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Your Selection ({pillars.length}/5)
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {pillars.map((p) => (
                                    <span
                                        key={p}
                                        className="inline-flex items-center px-2 py-1 bg-white border border-slate-200 rounded text-sm text-slate-700"
                                    >
                                        {p}
                                        <button
                                            onClick={() => togglePillar(p)}
                                            className="ml-2 text-slate-400 hover:text-red-500"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button
                        size="lg"
                        className="w-full mt-4"
                        onClick={handleNext}
                        disabled={pillars.length === 0}
                    >
                        Next: Train Voice →
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
