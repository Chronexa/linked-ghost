'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useUser, useUpdateProfile } from '@/lib/hooks/use-user';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export function ProfileSettings() {
    const { data: userData, isLoading } = useUser();
    const updateProfile = useUpdateProfile();
    const profile = (userData as any)?.data?.profile;

    const [formData, setFormData] = useState<any>({});
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        identity: true,
        background: false,
        positioning: false,
        network: false
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.fullName || '',
                currentRole: profile.currentRole || '',
                companyName: profile.companyName || '',
                industry: profile.industry || '',
                location: profile.location || '',
                yearsOfExperience: profile.yearsOfExperience || '',
                keyExpertise: profile.keyExpertise || [],
                careerHighlights: profile.careerHighlights || '',
                currentResponsibilities: profile.currentResponsibilities || '',
                about: profile.about || '',
                howYouWantToBeSeen: profile.howYouWantToBeSeen || '',
                uniqueAngle: profile.uniqueAngle || '',
                currentConnections: profile.currentConnections || '',
                targetConnections: profile.targetConnections || '',
                networkComposition: profile.networkComposition || [],
                idealNetworkProfile: profile.idealNetworkProfile || '',
                linkedinGoal: profile.linkedinGoal || '',
            });
        }
    }, [profile]);

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleSave = async (section: string) => {
        try {
            await updateProfile.mutateAsync({
                ...formData,
                currentConnections: Number(formData.currentConnections) || 0,
                targetConnections: Number(formData.targetConnections) || 0,
            });
            // toast.success is handled by the hook
        } catch (error) {
            // toast.error is handled by the hook
        }
    };

    const [expertiseInput, setExpertiseInput] = useState('');

    const addExpertise = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && expertiseInput.trim()) {
            e.preventDefault();
            const current = formData.keyExpertise || [];
            if (current.length < 5) {
                setFormData({ ...formData, keyExpertise: [...current, expertiseInput.trim()] });
                setExpertiseInput('');
            } else {
                toast.error("Max 5 skills allowed");
            }
        }
    };

    const removeExpertise = (tag: string) => {
        setFormData({ ...formData, keyExpertise: (formData.keyExpertise || []).filter((t: string) => t !== tag) });
    };

    const addNetworkType = (type: string) => {
        const current = formData.networkComposition || [];
        if (!current.includes(type)) {
            setFormData({ ...formData, networkComposition: [...current, type] });
        } else {
            setFormData({ ...formData, networkComposition: current.filter((t: string) => t !== type) });
        }
    };

    if (isLoading) return <div>Loading profile...</div>;

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Identity Section */}
            <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow-card transition-all duration-300">
                <CardHeader
                    className="cursor-pointer hover:bg-surface-hover/50 transition-colors py-6"
                    onClick={() => toggleSection('identity')}
                >
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">Professional Identity</CardTitle>
                            <CardDescription>Your core LinkedIn header information</CardDescription>
                        </div>
                        {openSections.identity ? <ChevronDown className="h-5 w-5 text-charcoal-light" /> : <ChevronRight className="h-5 w-5 text-charcoal-light" />}
                    </div>
                </CardHeader>
                <Collapsible open={openSections.identity}>
                    <CollapsibleContent>
                        <CardContent className="space-y-6 pt-2 pb-8 px-8 border-t border-border/40 bg-surface/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-charcoal-light">Full Name</Label>
                                    <Input value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-charcoal-light">Location</Label>
                                    <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-charcoal-light">Current Role</Label>
                                    <Input value={formData.currentRole} onChange={e => setFormData({ ...formData, currentRole: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-charcoal-light">Company</Label>
                                    <Input value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-charcoal-light">Industry</Label>
                                <select
                                    className="select"
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
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => handleSave('identity')} isLoading={updateProfile.isPending} variant="primary">Save Identity</Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Background Section */}
            <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow-card transition-all duration-300">
                <CardHeader
                    className="cursor-pointer hover:bg-surface-hover/50 transition-colors py-6"
                    onClick={() => toggleSection('background')}
                >
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">Professional Background</CardTitle>
                            <CardDescription>Your career story and expertise</CardDescription>
                        </div>
                        {openSections.background ? <ChevronDown className="h-5 w-5 text-charcoal-light" /> : <ChevronRight className="h-5 w-5 text-charcoal-light" />}
                    </div>
                </CardHeader>
                <Collapsible open={openSections.background}>
                    <CollapsibleContent>
                        <CardContent className="space-y-6 pt-2 pb-8 px-8 border-t border-border/40 bg-surface/50">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-charcoal-light">Years of Experience</Label>
                                <div className="flex flex-wrap gap-3">
                                    {['0-2', '3-5', '6-10', '11-15', '15+'].map(range => (
                                        <Button
                                            key={range}
                                            type="button"
                                            variant={formData.yearsOfExperience === range ? 'primary' : 'secondary'}
                                            size="sm"
                                            onClick={() => setFormData({ ...formData, yearsOfExperience: range })}
                                            className="h-9"
                                        >
                                            {range} Years
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-charcoal-light">Key Expertise (Max 5)</Label>
                                <Input
                                    value={expertiseInput}
                                    onChange={e => setExpertiseInput(e.target.value)}
                                    onKeyDown={addExpertise}
                                    placeholder="Type and enter..."
                                />
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(formData.keyExpertise || []).map((skill: string) => (
                                        <Badge key={skill} variant="neutral" className="gap-1 px-3 py-1.5 text-sm">
                                            {skill}
                                            <span
                                                className="cursor-pointer ml-2 text-charcoal-light/50 hover:text-charcoal"
                                                onClick={() => removeExpertise(skill)}
                                            >×</span>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-charcoal-light">Career Highlights</Label>
                                <Textarea value={formData.careerHighlights} onChange={e => setFormData({ ...formData, careerHighlights: e.target.value })} rows={4} />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => handleSave('background')} isLoading={updateProfile.isPending} variant="primary">Save Background</Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Positioning Section */}
            <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow-card transition-all duration-300">
                <CardHeader
                    className="cursor-pointer hover:bg-surface-hover/50 transition-colors py-6"
                    onClick={() => toggleSection('positioning')}
                >
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">Personal Positioning</CardTitle>
                            <CardDescription>How you want to be seen by your audience</CardDescription>
                        </div>
                        {openSections.positioning ? <ChevronDown className="h-5 w-5 text-charcoal-light" /> : <ChevronRight className="h-5 w-5 text-charcoal-light" />}
                    </div>
                </CardHeader>
                <Collapsible open={openSections.positioning}>
                    <CollapsibleContent>
                        <CardContent className="space-y-6 pt-2 pb-8 px-8 border-t border-border/40 bg-surface/50">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-charcoal-light">Archetype</Label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {['expert', 'thought_leader', 'peer', 'educator', 'builder'].map(id => (
                                        <div
                                            key={id}
                                            className={cn(
                                                "border rounded-lg py-3 px-2 text-center cursor-pointer text-sm capitalize transition-all duration-200 hover:border-brand/30",
                                                formData.howYouWantToBeSeen === id
                                                    ? "border-brand bg-brand/5 font-semibold text-brand shadow-sm"
                                                    : "border-border bg-surface text-charcoal-light"
                                            )}
                                            onClick={() => setFormData({ ...formData, howYouWantToBeSeen: id })}
                                        >
                                            {id.replace('_', ' ')}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-charcoal-light">About</Label>
                                <Textarea value={formData.about} onChange={e => setFormData({ ...formData, about: e.target.value })} rows={5} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-charcoal-light">Unique Angle</Label>
                                <Textarea value={formData.uniqueAngle} onChange={e => setFormData({ ...formData, uniqueAngle: e.target.value })} rows={3} />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => handleSave('positioning')} isLoading={updateProfile.isPending} variant="primary">Save Positioning</Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            {/* Network Section */}
            <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow-card transition-all duration-300">
                <CardHeader
                    className="cursor-pointer hover:bg-surface-hover/50 transition-colors py-6"
                    onClick={() => toggleSection('network')}
                >
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">Network & Goals</CardTitle>
                            <CardDescription>Your audience composition and targets</CardDescription>
                        </div>
                        {openSections.network ? <ChevronDown className="h-5 w-5 text-charcoal-light" /> : <ChevronRight className="h-5 w-5 text-charcoal-light" />}
                    </div>
                </CardHeader>
                <Collapsible open={openSections.network}>
                    <CollapsibleContent>
                        <CardContent className="space-y-6 pt-2 pb-8 px-8 border-t border-border/40 bg-surface/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-charcoal-light">Current Connections</Label>
                                    <Input type="number" value={formData.currentConnections} onChange={e => setFormData({ ...formData, currentConnections: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-charcoal-light">Target</Label>
                                    <Input type="number" value={formData.targetConnections} onChange={e => setFormData({ ...formData, targetConnections: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-charcoal-light">Network Composition</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['Founders', 'Investors', 'Marketers', 'Engineers', 'Product Managers', 'Recruiters'].map(role => (
                                        <Badge
                                            key={role}
                                            variant={(formData.networkComposition || []).includes(role) ? 'brand' : 'neutral'}
                                            className={cn("cursor-pointer px-3 py-1.5 transition-all text-sm", (formData.networkComposition || []).includes(role) ? "shadow-sm" : "hover:bg-charcoal/10")}
                                            onClick={() => addNetworkType(role)}
                                        >
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-charcoal-light">Primary Goal</Label>
                                <select
                                    className="select"
                                    value={formData.linkedinGoal}
                                    onChange={e => setFormData({ ...formData, linkedinGoal: e.target.value })}
                                >
                                    <option value="">Select...</option>
                                    <option value="brand">Build Personal Brand</option>
                                    <option value="leads">Generate Leads</option>
                                    <option value="hiring">Hiring / Talent</option>
                                    <option value="networking">Networking</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-charcoal-light">Ideal Network Profile</Label>
                                <Textarea value={formData.idealNetworkProfile} onChange={e => setFormData({ ...formData, idealNetworkProfile: e.target.value })} rows={3} />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => handleSave('network')} isLoading={updateProfile.isPending} variant="primary">Save Network</Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
        </div>
    );
}
