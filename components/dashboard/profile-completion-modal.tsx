'use client';

import { useState, useEffect } from 'react';
import { useUser, useUpdateProfile } from '@/lib/hooks/use-user';
import { Button, Input } from '@/components/ui';
import { Linkedin, X } from 'lucide-react';
import { showError, showSuccess } from '@/lib/toast-utils';

export function ProfileCompletionModal() {
    const { data: userProfile } = useUser();
    const updateProfile = useUpdateProfile();
    const [isOpen, setIsOpen] = useState(false);
    const [linkedinUrl, setLinkedinUrl] = useState('');

    useEffect(() => {
        // Show modal if LinkedIn URL is missing and not dismissed recently
        const profile = userProfile?.data?.profile;
        if (profile && !profile.linkedinUrl) {
            const dismissedAt = localStorage.getItem('profile_modal_dismissed');
            if (!dismissedAt || Date.now() - parseInt(dismissedAt) > 24 * 60 * 60 * 1000) {
                setIsOpen(true);
            }
        }
    }, [userProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!linkedinUrl.trim()) return;

        if (!linkedinUrl.includes('linkedin.com/in/')) {
            showError('Please enter a valid LinkedIn profile URL');
            return;
        }

        try {
            await updateProfile.mutateAsync({ linkedinUrl: linkedinUrl.trim() });
            showSuccess('Profile updated!');
            setIsOpen(false);
        } catch (error) {
            showError('Failed to save profile');
        }
    };

    const handleDismiss = () => {
        setIsOpen(false);
        localStorage.setItem('profile_modal_dismissed', Date.now().toString());
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 relative">
                    <button
                        onClick={handleDismiss}
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <Linkedin className="w-6 h-6 text-blue-600" />
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                        Complete your profile
                    </h2>
                    <p className="text-slate-600 mb-6">
                        Add your LinkedIn URL to help the AI learn your writing style and generate better content.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Input
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                placeholder="https://www.linkedin.com/in/your-profile"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={!linkedinUrl.trim() || updateProfile.isPending}
                                isLoading={updateProfile.isPending}
                            >
                                Save & Continue
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleDismiss}
                            >
                                Later
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
