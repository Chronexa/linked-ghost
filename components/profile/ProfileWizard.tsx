'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUpdateProfile } from '@/lib/hooks/use-user';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProfileWizardProps {
    onComplete: () => void;
    initialData?: any;
}

const STEPS = [
    { id: 'identity', title: 'Identity', description: 'Who are you professionally?' },
    { id: 'background', title: 'Background', description: 'Your career story & expertise' },
    { id: 'positioning', title: 'Positioning', description: 'How you want to be seen' },
    { id: 'network', title: 'Network', description: 'Your audience & goals' },
];

export function ProfileWizard({ onComplete, initialData }: ProfileWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const updateProfile = useUpdateProfile();

    const [formData, setFormData] = useState({
        // Identity
        fullName: initialData?.fullName || '',
        currentRole: initialData?.currentRole || '',
        companyName: initialData?.companyName || '',
        industry: initialData?.industry || '',
        location: initialData?.location || '',

        // Background
        yearsOfExperience: initialData?.yearsOfExperience || '',
        keyExpertise: initialData?.keyExpertise || [],
        careerHighlights: initialData?.careerHighlights || '',
        currentResponsibilities: initialData?.currentResponsibilities || '',

        // Positioning
        about: initialData?.about || '',
        howYouWantToBeSeen: initialData?.howYouWantToBeSeen || '',
        uniqueAngle: initialData?.uniqueAngle || '',

        // Network
        currentConnections: initialData?.currentConnections || '',
        targetConnections: initialData?.targetConnections || '',
        networkComposition: initialData?.networkComposition || [],
        idealNetworkProfile: initialData?.idealNetworkProfile || '',
        linkedinGoal: initialData?.linkedinGoal || '',
    });

    const [expertiseInput, setExpertiseInput] = useState('');
    const [networkInput, setNetworkInput] = useState('');

    const calculateCompleteness = () => {
        const fields = [
            formData.fullName,
            formData.currentRole,
            formData.industry,
            formData.yearsOfExperience,
            formData.about,
            formData.keyExpertise?.length > 0,
            formData.howYouWantToBeSeen,
            formData.uniqueAngle,
            formData.idealNetworkProfile,
            formData.linkedinGoal,
        ];
        const filled = fields.filter(Boolean).length;
        return Math.round((filled / fields.length) * 100);
    };

    const handleNext = async () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Final save
            try {
                await updateProfile.mutateAsync({
                    ...formData,
                    profileCompleteness: calculateCompleteness(),
                    currentConnections: Number(formData.currentConnections) || 0,
                    targetConnections: Number(formData.targetConnections) || 0,
                });
                toast.success("Profile Setup Complete!");
                onComplete();
            } catch (error) {
                toast.error("Failed to save profile");
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const addExpertise = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && expertiseInput.trim()) {
            e.preventDefault();
            if (formData.keyExpertise.length < 5) {
                setFormData(prev => ({
                    ...prev,
                    keyExpertise: [...prev.keyExpertise, expertiseInput.trim()]
                }));
                setExpertiseInput('');
            } else {
                toast.error("Max 5 skills allowed");
            }
        }
    };

    const removeExpertise = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            keyExpertise: prev.keyExpertise.filter((t: string) => t !== tag)
        }));
    };

    const addNetworkType = (type: string) => {
        if (!formData.networkComposition.includes(type)) {
            setFormData(prev => ({
                ...prev,
                networkComposition: [...prev.networkComposition, type]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                networkComposition: prev.networkComposition.filter((t: string) => t !== type)
            }));
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Identity
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="e.g. Jane Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. San Francisco, CA"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Current Role *</Label>
                            <Input
                                value={formData.currentRole}
                                onChange={e => setFormData({ ...formData, currentRole: e.target.value })}
                                placeholder="e.g. Product Manager"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Company</Label>
                            <Input
                                value={formData.companyName}
                                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                placeholder="e.g. Acme Corp"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Industry *</Label>
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

            case 1: // Background
                return (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label>Years of Experience *</Label>
                            <div className="flex flex-wrap gap-2">
                                {['0-2', '3-5', '6-10', '11-15', '15+'].map(range => (
                                    <Button
                                        key={range}
                                        type="button"
                                        variant={formData.yearsOfExperience === range ? 'primary' : 'secondary'}
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, yearsOfExperience: range })}
                                    >
                                        {range} Years
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Key Expertise (Max 5) *</Label>
                            <Input
                                value={expertiseInput}
                                onChange={e => setExpertiseInput(e.target.value)}
                                onKeyDown={addExpertise}
                                placeholder="Type skill and hit Enter..."
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.keyExpertise.map((skill: string) => (
                                    <Badge key={skill} variant="neutral" className="gap-1 px-3 py-1">
                                        {skill}
                                        <span
                                            className="cursor-pointer ml-1 text-muted-foreground hover:text-foreground"
                                            onClick={() => removeExpertise(skill)}
                                        >×</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Career Highlights</Label>
                            <Textarea
                                value={formData.careerHighlights}
                                onChange={e => setFormData({ ...formData, careerHighlights: e.target.value })}
                                placeholder="Briefly list 2-3 major achievements..."
                                rows={3}
                            />
                        </div>
                    </div>
                );

            case 2: // Positioning
                return (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label>How do you want to be seen? *</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { id: 'expert', label: 'Expert', desc: 'Deep technical knowledge' },
                                    { id: 'thought_leader', label: 'Thought Leader', desc: 'Challenging status quo' },
                                    { id: 'peer', label: 'Peer', desc: 'Learning in public' },
                                    { id: 'educator', label: 'Educator', desc: 'Simplifying concepts' },
                                    { id: 'builder', label: 'Builder', desc: 'Sharing the journey' }
                                ].map(opt => (
                                    <div
                                        key={opt.id}
                                        className={cn(
                                            "border rounded-lg p-3 cursor-pointer transition-all hover:bg-accent",
                                            formData.howYouWantToBeSeen === opt.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                                        )}
                                        onClick={() => setFormData({ ...formData, howYouWantToBeSeen: opt.id })}
                                    >
                                        <div className="font-medium text-sm">{opt.label}</div>
                                        <div className="text-xs text-muted-foreground">{opt.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>About / Bio *</Label>
                            <Textarea
                                value={formData.about}
                                onChange={e => setFormData({ ...formData, about: e.target.value })}
                                placeholder="Your professional summary..."
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Unique Angle</Label>
                            <Textarea
                                value={formData.uniqueAngle}
                                onChange={e => setFormData({ ...formData, uniqueAngle: e.target.value })}
                                placeholder="What makes your perspective unique?"
                                rows={2}
                            />
                        </div>
                    </div>
                );

            case 3: // Network
                return (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Current Connections</Label>
                                <Input
                                    type="number"
                                    value={formData.currentConnections}
                                    onChange={e => setFormData({ ...formData, currentConnections: e.target.value })}
                                    placeholder="e.g. 500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Target Connections</Label>
                                <Input
                                    type="number"
                                    value={formData.targetConnections}
                                    onChange={e => setFormData({ ...formData, targetConnections: e.target.value })}
                                    placeholder="e.g. 5000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Who is in your network? (Select all that apply)</Label>
                            <div className="flex flex-wrap gap-2">
                                {['Founders', 'Investors', 'Marketers', 'Engineers', 'Product Managers', 'Recruiters'].map(role => (
                                    <Badge
                                        key={role}
                                        variant={formData.networkComposition.includes(role) ? 'brand' : 'neutral'}
                                        className="cursor-pointer px-3 py-1"
                                        onClick={() => addNetworkType(role)}
                                    >
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Primary Goal *</Label>
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.linkedinGoal}
                                onChange={e => setFormData({ ...formData, linkedinGoal: e.target.value })}
                            >
                                <option value="">Select a goal...</option>
                                <option value="brand">Build Personal Brand</option>
                                <option value="leads">Generate Leads</option>
                                <option value="hiring">Hiring / Talent</option>
                                <option value="networking">Networking</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Ideal Network Profile</Label>
                            <Textarea
                                value={formData.idealNetworkProfile}
                                onChange={e => setFormData({ ...formData, idealNetworkProfile: e.target.value })}
                                placeholder="Who do you want to reach?"
                                rows={2}
                            />
                        </div>
                    </div>
                );
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-none shadow-lg bg-card">
            <CardHeader className="bg-muted/30 border-b pb-6">
                <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-2xl font-display">Profile Builder</CardTitle>
                    <span className="text-sm font-medium text-muted-foreground">
                        Step {currentStep + 1} of {STEPS.length}
                    </span>
                </div>
                <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2" />
                <div className="mt-4">
                    <h3 className="font-semibold text-lg">{STEPS[currentStep].title}</h3>
                    <p className="text-muted-foreground">{STEPS[currentStep].description}</p>
                </div>
            </CardHeader>

            <CardContent className="pt-6 min-h-[400px]">
                {renderStepContent()}
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-6 bg-muted/10">
                <Button
                    variant="secondary"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <Button onClick={handleNext} disabled={updateProfile.isPending}>
                    {updateProfile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
                    {currentStep < STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
            </CardFooter>
        </Card>
    );
}
