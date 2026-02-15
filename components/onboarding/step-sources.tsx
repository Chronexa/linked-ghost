import { useState } from 'react';
import { Button, Input, Card, CardContent, Badge } from '@/components/ui';
import { showSuccess } from '@/lib/toast-utils';

export interface SourceData {
    perplexity: boolean;
    reddit: boolean;
    redditKeywords: string;
}

interface StepSourcesProps {
    initialData?: Partial<SourceData>;
    onNext: (data: SourceData) => void;
    onBack: () => void;
}

export function StepSources({ initialData, onNext, onBack }: StepSourcesProps) {
    const [sources, setSources] = useState<SourceData>({
        perplexity: true,
        reddit: initialData?.reddit || false,
        redditKeywords: initialData?.redditKeywords || '',
    });

    const handleNext = () => {
        onNext(sources);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
                    Where should we look for ideas?
                </h1>
                <p className="text-slate-600">
                    We scan these sources daily at 6 AM to find content matching your pillars.
                </p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-4">

                    {/* Perplexity Source */}
                    <div className="flex items-start p-4 bg-slate-50 rounded-lg border border-slate-200 opacity-90">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-slate-900">Daily News Radar</h3>
                                <Badge variant="success" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
                                    Connected
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-500">
                                Powered by Perplexity AI. Scans industry news and trends.
                            </p>
                        </div>
                        <div>
                            {/* Toggle locked ON */}
                            <div className="w-11 h-6 bg-emerald-500 rounded-full relative opacity-50 cursor-not-allowed">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Reddit Source */}
                    <div className={`p-4 rounded-lg border transition-all duration-200 ${sources.reddit ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 mb-1">Reddit Trends</h3>
                                <p className="text-sm text-slate-500">
                                    Monitor discussions in specific communities.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={sources.reddit}
                                    onChange={(e) => setSources(prev => ({ ...prev, reddit: e.target.checked }))}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                            </label>
                        </div>

                        {/* Expanded Options for Reddit */}
                        <div className={`grid transition-all duration-300 ease-in-out ${sources.reddit ? 'grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-slate-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                                <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    Keywords to watch
                                </label>
                                <Input
                                    value={sources.redditKeywords}
                                    onChange={(e) => setSources(prev => ({ ...prev, redditKeywords: e.target.value }))}
                                    placeholder="e.g. saas, startups, marketing"
                                    className="bg-white"
                                />
                                <p className="text-xs text-slate-400 mt-2">
                                    Use commas to separate keywords.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full mt-4"
                        onClick={handleNext}
                    >
                        Finish Setup
                    </Button>

                    <div className="text-center">
                        <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600">
                            ← Back to Voice
                        </button>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
