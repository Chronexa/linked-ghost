'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'sources' | 'billing'>('account');
  const [isSaving, setIsSaving] = useState(false);

  // Account settings state
  const [accountData, setAccountData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    linkedinUrl: 'linkedin.com/in/johndoe',
  });

  // Sources settings state
  const [sourcesData, setSourcesData] = useState({
    perplexityEnabled: true,
    redditEnabled: true,
    redditKeywords: 'AI, startups, productivity',
    manualEnabled: true,
  });

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleSaveSources = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charcoal">Settings</h1>
        <p className="text-charcoal-light mt-1">
          Manage your account and preferences
        </p>
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
                  <Input
                    label="Full Name"
                    type="text"
                    value={accountData.name}
                    onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                    placeholder="John Doe"
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    placeholder="john@example.com"
                    helperText="We'll never share your email with anyone"
                  />

                  <Input
                    label="LinkedIn Profile URL"
                    type="text"
                    value={accountData.linkedinUrl}
                    onChange={(e) =>
                      setAccountData({ ...accountData, linkedinUrl: e.target.value })
                    }
                    placeholder="linkedin.com/in/johndoe"
                    helperText="Your public LinkedIn profile URL"
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      isLoading={isSaving}
                      loadingText="Saving..."
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>

                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="font-semibold text-charcoal mb-4">Danger Zone</h3>
                  <Button variant="secondary" className="border-error text-error hover:bg-error/5">
                    Delete Account
                  </Button>
                </div>
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

                    {/* Reddit */}
                    <div className="p-4 bg-background rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-charcoal">Reddit</h4>
                          <p className="text-sm text-charcoal-light">
                            Monitor Reddit discussions by keywords
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sourcesData.redditEnabled}
                            onChange={(e) =>
                              setSourcesData({
                                ...sourcesData,
                                redditEnabled: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-brand after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                      </div>
                      {sourcesData.redditEnabled && (
                        <Input
                          label="Keywords (comma-separated)"
                          type="text"
                          value={sourcesData.redditKeywords}
                          onChange={(e) =>
                            setSourcesData({
                              ...sourcesData,
                              redditKeywords: e.target.value,
                            })
                          }
                          placeholder="AI, startups, productivity"
                        />
                      )}
                    </div>

                    {/* Manual */}
                    <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                      <div>
                        <h4 className="font-semibold text-charcoal">Manual Input</h4>
                        <p className="text-sm text-charcoal-light">
                          Add topics manually
                        </p>
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
                    <Button
                      type="submit"
                      isLoading={isSaving}
                      loadingText="Saving..."
                    >
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
                        <h3 className="font-display text-2xl font-bold text-charcoal">Growth Plan</h3>
                        <p className="text-charcoal-light mt-1">
                          $79/month • 30 posts • 5 pillars
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-brand">$79</div>
                        <div className="text-xs text-charcoal-light">per month</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button variant="secondary" size="sm">
                        Change Plan
                      </Button>
                      <Button variant="secondary" size="sm" className="border-error text-error hover:bg-error/5">
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>

                  {/* Usage */}
                  <div>
                    <h4 className="font-semibold text-charcoal mb-3">Current Usage</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-charcoal-light">Posts this month</span>
                          <span className="font-semibold text-charcoal">12 / 30</span>
                        </div>
                        <div className="bg-border rounded-full h-2 overflow-hidden">
                          <div className="bg-brand h-full rounded-full" style={{ width: '40%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-charcoal-light">Active pillars</span>
                          <span className="font-semibold text-charcoal">3 / 5</span>
                        </div>
                        <div className="bg-border rounded-full h-2 overflow-hidden">
                          <div className="bg-success h-full rounded-full" style={{ width: '60%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h4 className="font-semibold text-charcoal mb-3">Payment Method</h4>
                    <div className="p-4 bg-background rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-8 bg-charcoal rounded flex items-center justify-center text-white text-xs font-bold">
                          VISA
                        </div>
                        <div>
                          <p className="text-sm font-medium text-charcoal">•••• 4242</p>
                          <p className="text-xs text-charcoal-light">Expires 12/25</p>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm">
                        Update
                      </Button>
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
