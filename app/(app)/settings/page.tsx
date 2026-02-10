'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import { useUser, useUpdateProfile, useSubscription } from '@/lib/hooks/use-user';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'sources' | 'billing'>('account');

  // Fetch user data from APIs
  const { data: userData } = useUser();
  const { data: subscriptionData } = useSubscription();
  const updateProfile = useUpdateProfile();

  // Account settings state
  const [accountData, setAccountData] = useState({
    linkedinUrl: '',
    targetAudience: '',
    writingStyle: '',
  });

  // Initialize form with user data
  useEffect(() => {
    if (userData?.data?.profile) {
      const profile = userData.data.profile;
      setAccountData({
        linkedinUrl: profile.linkedinUrl || '',
        targetAudience: profile.targetAudience || '',
        writingStyle: profile.writingStyle || '',
      });
    }
  }, [userData]);

  // Sources settings state (client-side only for now)
  const [sourcesData, setSourcesData] = useState({
    perplexityEnabled: true,
    redditEnabled: true,
    redditKeywords: 'AI, startups, productivity',
    manualEnabled: true,
  });

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(accountData);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleSaveSources = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement sources API when backend is ready
    console.log('Saving sources:', sourcesData);
  };

  const user = userData?.data?.user;
  const profile = userData?.data?.profile;
  const subscription = subscriptionData?.data;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charcoal">Settings</h1>
        <p className="text-charcoal-light mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition ${
                    activeTab === 'account'
                      ? 'bg-brand text-white'
                      : 'text-charcoal-light hover:bg-background'
                  }`}
                >
                  Account
                </button>
                <button
                  onClick={() => setActiveTab('sources')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition ${
                    activeTab === 'sources'
                      ? 'bg-brand text-white'
                      : 'text-charcoal-light hover:bg-background'
                  }`}
                >
                  Content Sources
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition ${
                    activeTab === 'billing'
                      ? 'bg-brand text-white'
                      : 'text-charcoal-light hover:bg-background'
                  }`}
                >
                  Billing
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveAccount} className="space-y-6">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Full Name
                    </label>
                    <div className="text-charcoal-light">{user?.fullName || 'Not set'}</div>
                    <p className="text-xs text-charcoal-light mt-1">
                      Managed by your authentication provider
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-charcoal mb-2">Email</label>
                    <div className="text-charcoal-light">{user?.email || 'Not set'}</div>
                    <p className="text-xs text-charcoal-light mt-1">
                      Managed by your authentication provider
                    </p>
                  </div>

                  <Input
                    label="LinkedIn Profile URL"
                    type="text"
                    value={accountData.linkedinUrl}
                    onChange={(e) =>
                      setAccountData({ ...accountData, linkedinUrl: e.target.value })
                    }
                    placeholder="linkedin.com/in/yourprofile"
                    helperText="Your public LinkedIn profile URL"
                  />

                  <Input
                    label="Target Audience"
                    type="text"
                    value={accountData.targetAudience}
                    onChange={(e) =>
                      setAccountData({ ...accountData, targetAudience: e.target.value })
                    }
                    placeholder="e.g., Tech founders, marketing professionals"
                    helperText="Who are you writing for?"
                  />

                  <Input
                    label="Writing Style"
                    type="text"
                    value={accountData.writingStyle}
                    onChange={(e) =>
                      setAccountData({ ...accountData, writingStyle: e.target.value })
                    }
                    placeholder="e.g., casual, professional, thought-leader"
                    helperText="Your preferred writing tone"
                  />

                  {profile && (
                    <div className="p-4 bg-background rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-charcoal-light">Voice Confidence</label>
                          <p className="font-semibold text-charcoal">
                            {profile.voiceConfidenceScore}%
                          </p>
                        </div>
                        <div>
                          <label className="text-charcoal-light">Pillars Created</label>
                          <p className="font-semibold text-charcoal">{user?.pillarsCount || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      type="submit"
                      isLoading={updateProfile.isPending}
                      loadingText="Saving..."
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Sources Tab */}
          {activeTab === 'sources' && (
            <Card>
              <CardHeader>
                <CardTitle>Content Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSources} className="space-y-6">
                  <div className="space-y-4">
                    {/* Perplexity */}
                    <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                      <div>
                        <h4 className="font-semibold text-charcoal">Perplexity AI</h4>
                        <p className="text-sm text-charcoal-light">
                          Automatic news and trend discovery
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sourcesData.perplexityEnabled}
                          onChange={(e) =>
                            setSourcesData({
                              ...sourcesData,
                              perplexityEnabled: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-brand after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>

                    {/* Manual */}
                    <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                      <div>
                        <h4 className="font-semibold text-charcoal">Manual Input</h4>
                        <p className="text-sm text-charcoal-light">Add topics manually</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sourcesData.manualEnabled}
                          onChange={(e) =>
                            setSourcesData({
                              ...sourcesData,
                              manualEnabled: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-brand after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" loadingText="Saving...">
                      Save Sources
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Plan */}
                  <div className="p-6 bg-brand/5 border border-brand/20 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-display text-2xl font-bold text-charcoal">
                          {subscription?.planName || 'Free Plan'}
                        </h3>
                        <p className="text-charcoal-light mt-1">
                          {subscription?.status || 'Active'}
                        </p>
                      </div>
                      {subscription?.monthlyPostLimit && (
                        <div className="text-right">
                          <div className="text-3xl font-bold text-brand">
                            {subscription.monthlyPostLimit}
                          </div>
                          <div className="text-xs text-charcoal-light">posts/month</div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button variant="secondary" size="sm">
                        Manage Subscription
                      </Button>
                    </div>
                  </div>

                  {/* Usage */}
                  <div>
                    <h4 className="font-semibold text-charcoal mb-3">Current Usage</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-charcoal-light">Active pillars</span>
                          <span className="font-semibold text-charcoal">
                            {user?.pillarsCount || 0}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-charcoal-light">Voice confidence</span>
                          <span className="font-semibold text-charcoal">
                            {profile?.voiceConfidenceScore || 0}%
                          </span>
                        </div>
                        <div className="bg-border rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-brand h-full rounded-full"
                            style={{ width: `${profile?.voiceConfidenceScore || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
