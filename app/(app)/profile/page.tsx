'use client';

import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { ProfileWizard } from '@/components/profile/ProfileWizard';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '@/lib/hooks/use-user';

export default function ProfilePage() {
    const [showWizard, setShowWizard] = useState(false);
    const { data: userData } = useUser();
    const profile = (userData as any)?.data?.profile;

    if (showWizard) {
        return (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="relative w-full max-w-2xl bg-background rounded-lg shadow-xl border overflow-y-auto max-h-[90vh]">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 z-10 h-8 w-8 p-0"
                        onClick={() => setShowWizard(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <div className="p-1">
                        <ProfileWizard
                            initialData={profile}
                            onComplete={() => setShowWizard(false)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10 px-6 pt-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-charcoal">Profile</h1>
                    <p className="text-charcoal-light mt-0.5">Manage your professional identity and network goals</p>
                </div>
                <Button variant="secondary" className="gap-2" onClick={() => setShowWizard(true)}>
                    <Sparkles className="w-4 h-4 text-brand" />
                    Open Guided Wizard
                </Button>
            </div>

            <ProfileSettings />
        </div>
    );
}
