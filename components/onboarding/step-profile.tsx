import { useState } from 'react';
import { Button, Textarea, Card, CardContent, Input } from '@/components/ui';
import { showError } from '@/lib/toast-utils';
import { Target, TrendingUp, Users, Eye, Sparkles, Linkedin } from 'lucide-react';

export interface ProfileData {
    contentGoal: 'brand' | 'leadership' | 'leads' | 'visibility' | 'other';
    customGoal?: string;
    targetAudience: string;
    linkedinUrl?: string; // Made optional
}

interface StepProfileProps {
    initialData?: Partial<ProfileData>;
    onNext: (data: ProfileData) => void;
}

const GOAL_OPTIONS = [
    {
        id: 'brand' as const,
        label: 'Build my personal brand',
        icon: Sparkles,
        description: 'Establish your unique identity and reputation',
    },
    {
        id: 'leadership' as const,
        label: 'Establish thought leadership',
        icon: TrendingUp,
        description: 'Share insights and become an industry expert',
    },
    {
        id: 'leads' as const,
        label: 'Generate leads for my business',
        icon: Target,
        description: 'Attract potential customers and clients',
    },
    {
        id: 'visibility' as const,
        label: 'Stay visible to my network',
        icon: Eye,
        description: 'Keep your professional connections engaged',
    },
    {
        id: 'other' as const,
        label: 'Other',
        icon: Users,
        description: 'I have a different goal in mind',
    },
];

export function StepProfile({ initialData, onNext }: StepProfileProps) {
    const [goal, setGoal] = useState<ProfileData['contentGoal'] | null>(
        initialData?.contentGoal || null
    );
    const [customGoal, setCustomGoal] = useState(initialData?.customGoal || '');
    const [audience, setAudience] = useState(initialData?.targetAudience || '');
    const [linkedinUrl, setLinkedinUrl] = useState(initialData?.linkedinUrl || '');

    const handleNext = () => {
        // Validate LinkedIn URL if provided
        if (linkedinUrl.trim() && !linkedinUrl.includes('linkedin.com/in/')) {
            showError('Please enter a valid LinkedIn profile URL (e.g., linkedin.com/in/username)');
            return;
        }

        if (!goal) {
            showError('Please select your content goal');
            return;
        }

        if (goal === 'other' && !customGoal.trim()) {
            showError('Please describe your goal');
            return;
        }

        if (!audience.trim() || audience.trim().length < 100) {
            showError('Please describe your target audience (at least 100 characters)');
            return;
        }

        onNext({
            contentGoal: goal,
            customGoal: goal === 'other' ? customGoal.trim() : undefined,
            targetAudience: audience.trim(),
            linkedinUrl: linkedinUrl.trim() || undefined,
        });
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
                    What brings you to ContentPilot?
                </h1>
                <p className="text-slate-600">
                    This helps us tailor content to your goals
                </p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-6">
                    {/* LinkedIn URL */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Your LinkedIn Profile URL
                        </label>
                        <div className="relative">
                            <Linkedin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                placeholder="https://www.linkedin.com/in/your-profile"
                                className="pl-10"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            We&apos;ll use this to learn your writing style (coming soon)
                        </p>
                    </div>

                    {/* Goal Selection */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-3 block">
                            Choose your primary goal
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {GOAL_OPTIONS.map((option) => {
                                const Icon = option.icon;
                                const isSelected = goal === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => setGoal(option.id)}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${isSelected
                                            ? 'border-slate-900 bg-slate-50 shadow-md'
                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className={`font-medium mb-1 ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                                    {option.label}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {option.description}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="text-slate-900 font-bold text-lg">✓</div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom Goal Input (shown when "Other" is selected) */}
                    {goal === 'other' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                Describe your goal
                            </label>
                            <Textarea
                                value={customGoal}
                                onChange={(e) => setCustomGoal(e.target.value)}
                                placeholder="e.g., Connect with remote work advocates and share productivity tips"
                                className="min-h-[80px]"
                            />
                        </div>
                    )}

                    {/* Target Audience */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 flex justify-between">
                            <span>Who do you want to reach on LinkedIn?</span>
                            <span className="text-xs text-slate-400 font-normal">
                                {audience.length}/100 chars min
                            </span>
                        </label>
                        <Textarea
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            placeholder="e.g., SaaS founders struggling with content consistency who want to build their personal brand on LinkedIn"
                            className="min-h-[100px]"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Be specific - the AI writes better when it knows who&apos;s listening
                        </p>
                    </div>

                    {/* Next Button */}
                    <Button
                        size="lg"
                        className="w-full mt-4"
                        onClick={handleNext}
                        disabled={!goal || !audience.trim() || audience.length < 100 || !linkedinUrl.trim()}
                    >
                        Next: Choose Topics →
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
