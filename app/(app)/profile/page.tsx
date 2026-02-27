'use client';

import { ProfileSettings } from '@/components/profile/ProfileSettings';

export default function ProfilePage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10 px-6 pt-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-charcoal">Profile</h1>
                    <p className="text-charcoal-light mt-0.5">Manage your professional identity and network goals</p>
                </div>
            </div>

            <ProfileSettings />
        </div>
    );
}
