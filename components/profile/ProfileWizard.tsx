'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { userApi } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface ProfileWizardProps {
    onComplete: () => void;
    initialData?: any;
}

const STEPS = [
    { id: 'identity', title: 'Who are you?', description: 'Your current role & industry.' },
    { id: 'topics', title: 'What do you talk about?', description: 'Enter 3 topics you want to highlight.' },
    { id: 'voice', title: 'Show us how you write.', description: 'Paste 2 of your best LinkedIn posts to extract your Voice DNA.' },
];

export function ProfileWizard({ onComplete, initialData }: ProfileWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isInferring, setIsInferring] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        role: initialData?.currentRole || '',
        industry: initialData?.industry || '',
        topics: initialData?.topics || [],
        post1: '',
        post2: ''
    });

    const [topicInput, setTopicInput] = useState('');

    const handleNext = async () => {
        if (currentStep === 0) {
            if (!formData.role || !formData.industry) {
                toast.error("Please fill in your role and industry.");
                return;
            }
        }
        if (currentStep === 1) {
            if (formData.topics.length === 0) {
                toast.error("Please add at least one topic.");
                return;
            }
        }

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Final step: Inference submission
            if (!formData.post1 || !formData.post2) {
                toast.error("Please paste 2 posts to analyze your voice.");
                return;
            }

            setIsInferring(true);
            try {
                const res = await userApi.inferOnboarding({
                    role: formData.role,
                    industry: formData.industry,
                    topics: formData.topics,
                    posts: [formData.post1, formData.post2]
                });

                toast.success("Profile fully optimized!");

                await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
                await queryClient.invalidateQueries({ queryKey: ['pillars'] });

                onComplete();

                if ((res as any)?.conversationId) {
                    router.push(`/dashboard?conversation=${(res as any).conversationId}`);
                } else {
                    router.push('/dashboard');
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to analyze profile. Please try again.");
                setIsInferring(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const addTopic = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && topicInput.trim()) {
            e.preventDefault();
            if (formData.topics.length < 5) {
                if (!formData.topics.includes(topicInput.trim())) {
                    setFormData(prev => ({
                        ...prev,
                        topics: [...prev.topics, topicInput.trim()]
                    }));
                }
                setTopicInput('');
            } else {
                toast.error("Max 5 topics allowed");
            }
        }
    };

    const removeTopic = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            topics: prev.topics.filter((t: string) => t !== tag)
        }));
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Identity
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label>What is your Current Role? *</Label>
                            <Input
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                placeholder="e.g. Founder, Product Manager, Growth Engineer"
                                className="h-12 text-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>What Industry do you operate in? *</Label>
                            <select
                                className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                value={formData.industry}
                                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                            >
                                <option value="">Select an industry...</option>
                                <option value="SaaS">SaaS / Software</option>
                                <option value="Fintech">Fintech</option>
                                <option value="Marketing">Marketing & Advertising</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Consulting">Consulting</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                );

            case 1: // Topics
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label>Topics (Type and hit Enter) *</Label>
                            <Input
                                value={topicInput}
                                onChange={e => setTopicInput(e.target.value)}
                                onKeyDown={addTopic}
                                placeholder="e.g. B2B Sales, AI Engineering, Bootstrapping..."
                                className="h-12 text-lg"
                            />
                            <div className="flex flex-wrap gap-2 mt-4">
                                {formData.topics.map((skill: string) => (
                                    <Badge key={skill} variant="neutral" className="gap-1 px-4 py-2 text-sm bg-brand/10 text-brand border-brand/20">
                                        {skill}
                                        <span
                                            className="cursor-pointer ml-2 hover:bg-brand/20 rounded-full p-0.5"
                                            onClick={() => removeTopic(skill)}
                                        >×</span>
                                    </Badge>
                                ))}
                                {formData.topics.length === 0 && (
                                    <span className="text-sm text-muted-foreground mt-2">No topics added yet. Add at least 1-3 topics.</span>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 2: // Voice
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label>Sample Post 1 *</Label>
                            <Textarea
                                value={formData.post1}
                                onChange={e => setFormData({ ...formData, post1: e.target.value })}
                                placeholder="Paste a successful or typical LinkedIn post you wrote..."
                                rows={4}
                                className="resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Sample Post 2 *</Label>
                            <Textarea
                                value={formData.post2}
                                onChange={e => setFormData({ ...formData, post2: e.target.value })}
                                placeholder="Paste another post to help us find your consistent Voice DNA..."
                                rows={4}
                                className="resize-none"
                            />
                        </div>

                        {isInferring && (
                            <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 flex flex-col items-center justify-center space-y-3 animate-in fade-in">
                                <Loader2 className="h-8 w-8 text-brand animate-spin" />
                                <p className="text-sm font-medium text-brand">AI is analyzing your profile & Voice DNA...</p>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-none shadow-xl bg-card">
            <CardHeader className="bg-muted/30 border-b pb-6 p-8">
                <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-3xl font-display flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-brand" /> ContentPilot Setup
                    </CardTitle>
                    <span className="text-sm font-medium text-muted-foreground bg-background px-3 py-1 rounded-full border">
                        Step {currentStep + 1} of {STEPS.length}
                    </span>
                </div>
                <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2 mb-4" />
                <div className="space-y-1">
                    <h3 className="font-semibold text-xl">{STEPS[currentStep].title}</h3>
                    <p className="text-muted-foreground">{STEPS[currentStep].description}</p>
                </div>
            </CardHeader>

            <CardContent className="pt-8 p-8 min-h-[350px]">
                {renderStepContent()}
            </CardContent>

            <CardFooter className="flex justify-between border-t p-8 bg-muted/10">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0 || isInferring}
                    className="h-11 px-6 min-w-[120px]"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <Button
                    onClick={handleNext}
                    disabled={isInferring}
                    className="h-11 px-8 min-w-[140px] shadow-md hover:shadow-lg transition-all"
                >
                    {currentStep === STEPS.length - 1 ? (
                        isInferring ? 'Analyzing...' : 'Activate Magic'
                    ) : (
                        <>Next <ChevronRight className="w-4 h-4 ml-2" /></>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
