'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Badge,
} from '@/components/ui';
import { RadioCard } from '@/components/ui/radio-card';
import {
  usePillars,
  useCreatePillar,
  useUpdatePillar,
  useDeletePillar,
} from '@/lib/hooks/use-pillars';
import {
  useVoiceExamples,
  useAddVoiceExample,
  useDeleteVoiceExample,
  useAnalyzeVoice,
} from '@/lib/hooks/use-voice';
import { useUser, useUpdateProfile, useSubscription } from '@/lib/hooks/use-user';
import { cn } from '@/lib/utils';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { Sparkles } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { User, Profile, Subscription, Pillar, VoiceExample } from '@/types';

type SettingsTab = 'profile' | 'pillars' | 'voice' | 'prompts' | 'integrations' | 'billing';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as SettingsTab) || 'profile';
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab') as SettingsTab;
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const { data: userDataResponse } = useUser();
  const { data: subscriptionDataResponse } = useSubscription();
  const { data: pillarsDataResponse } = usePillars({ status: 'active' });
  const { data: examplesDataResponse } = useVoiceExamples();
  const updateProfile = useUpdateProfile();
  const createPillar = useCreatePillar();
  const updatePillar = useUpdatePillar();
  const deletePillar = useDeletePillar();
  const addExample = useAddVoiceExample();
  const deleteExample = useDeleteVoiceExample();
  const analyzeVoice = useAnalyzeVoice();

  // Safely extract and cast data
  const user = (userDataResponse as any)?.data?.user as User | undefined;
  const profile = (userDataResponse as any)?.data?.profile as Profile | undefined;
  const subscription = (subscriptionDataResponse as any)?.data as Subscription | undefined;

  const pillars: Pillar[] = ((pillarsDataResponse as any)?.data ?? []) as Pillar[];
  const examples: VoiceExample[] = ((examplesDataResponse as any)?.data ?? []) as VoiceExample[];

  const [pillarForm, setPillarForm] = useState<{
    name: string;
    description: string;
    tone: string;
    targetAudience: string;
    cta: string;
    positioning: string;
  }>({
    name: '',
    description: '',
    tone: '',
    targetAudience: '',
    cta: '',
    positioning: '',
  });
  const [editingPillarId, setEditingPillarId] = useState<string | null>(null);
  const [voicePostText, setVoicePostText] = useState('');
  const [voiceExampleSource, setVoiceExampleSource] = useState<'own_post' | 'reference'>('own_post');
  const [integrations, setIntegrations] = useState({
    perplexityEnabled: true,
    redditKeywords: 'AI, startups, productivity',
  });
  const [accountData, setAccountData] = useState({
    linkedinUrl: '',
    linkedinHeadline: '',
    linkedinSummary: '',
    targetAudience: '',
    writingStyle: '',
  });
  const [defaultInstructions, setDefaultInstructions] = useState('');

  useEffect(() => {
    if (profile) {
      setAccountData({
        linkedinUrl: profile.linkedinUrl || '',
        linkedinHeadline: (profile as any).linkedinHeadline ?? '', // Type definition might need update if these fields are missing
        linkedinSummary: (profile as any).linkedinSummary ?? '',
        targetAudience: (profile as any).targetAudience || '',
        writingStyle: (profile as any).writingStyle || '',
      });
      // casting profile to any here because defaultInstructions might not be in the Profile interface yet
      setDefaultInstructions((profile as any).defaultInstructions ?? '');
    }
  }, [profile]);

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'pillars', label: 'Content Pillars' },
    { id: 'voice', label: 'Voice Training' },
    { id: 'prompts', label: 'Prompt personalisation' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'billing', label: 'Billing' },
  ];

  const handlePillarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPillarId) {
        await updatePillar.mutateAsync({ id: editingPillarId, data: pillarForm });
        setEditingPillarId(null);
      } else {
        await createPillar.mutateAsync(pillarForm);
      }
      setPillarForm({ name: '', description: '', tone: '', targetAudience: '', cta: '', positioning: '' });
    } catch { }
  };

  const handleVoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (voicePostText.trim().length < 50) return;
    try {
      await addExample.mutateAsync({ postText: voicePostText.trim(), source: voiceExampleSource });
      setVoicePostText('');
    } catch { }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-0.5">Manage your identity, content strategy, and account</p>
        </div>
      </div>

      {/* Horizontal Tabs Navigation */}
      <div className="border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Settings sections">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-all duration-200 focus:outline-none whitespace-nowrap',
                activeTab === id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-6">

        {activeTab === 'profile' && (
          <ProfileSettings />
        )}

        {activeTab === 'pillars' && (
          <Card>
            <CardHeader>
              <CardTitle>Content Pillars</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Define themes and target audience for each pillar. AI uses these to classify topics.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePillarSubmit} className="space-y-4">
                <Input
                  label={<div className="flex items-center gap-1">Pillar name <InfoTooltip content="A core theme or topic category for your brand (e.g. 'Leadership', 'Remote Work')." /></div>}
                  value={pillarForm.name}
                  onChange={(e) => setPillarForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Founder Journey"
                  required
                />
                <Textarea
                  label={<div className="flex items-center gap-1">Description (optional) <InfoTooltip content="Describe what this pillar covers to help the AI categorize topics correctly." /></div>}
                  value={pillarForm.description}
                  onChange={(e) => setPillarForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="What this pillar is about"
                  rows={2}
                />
                <Input
                  label={<div className="flex items-center gap-1">Target audience <InfoTooltip content="Who is this content for? Be specific (e.g. 'Series A Founders' vs 'Entrepreneurs')." /></div>}
                  value={pillarForm.targetAudience}
                  onChange={(e) => setPillarForm((p) => ({ ...p, targetAudience: e.target.value }))}
                  placeholder="e.g. First-time founders"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={<div className="flex items-center gap-1">Content Voice <InfoTooltip content="Adjectives describing how this pillar should sound (e.g. 'Authoritative', 'Empathetic')." /></div>}
                    value={pillarForm.tone}
                    onChange={(e) => setPillarForm((p) => ({ ...p, tone: e.target.value }))}
                    placeholder="e.g. Contrarian, Data-driven"
                  />
                  <Input
                    label={<div className="flex items-center gap-1">Positioning <InfoTooltip content="How do you want to be perceived in this pillar? (e.g. 'The expert', 'The learner')." /></div>}
                    value={pillarForm.positioning}
                    onChange={(e) => setPillarForm((p) => ({ ...p, positioning: e.target.value }))}
                    placeholder="e.g. The in-the-trenches builder"
                  />
                </div>

                <Input
                  label={<div className="flex items-center gap-1">Ending CTA <InfoTooltip content="Default call-to-action for posts in this pillar." /></div>}
                  value={pillarForm.cta}
                  onChange={(e) => setPillarForm((p) => ({ ...p, cta: e.target.value }))}
                  placeholder="e.g. Subscribe to my newsletter (link in bio)"
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={!pillarForm.name.trim() || createPillar.isPending || updatePillar.isPending}
                    isLoading={createPillar.isPending || updatePillar.isPending}
                    loadingText="Saving…"
                  >
                    {editingPillarId ? 'Update' : 'Add'} pillar
                  </Button>
                  {editingPillarId && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingPillarId(null);
                        setPillarForm({ name: '', description: '', tone: '', targetAudience: '', cta: '', positioning: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
              <ul className="divide-y divide-border">
                {pillars.length === 0 && (
                  <li className="py-4 text-sm text-muted-foreground">No pillars yet. Add one above.</li>
                )}
                {pillars.map((p: Pillar) => (
                  <li key={p.id} className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{p.name}</p>
                      {p.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {p.tone && <Badge variant="neutral" className="text-[10px] px-1.5 py-0.5">Voice: {p.tone}</Badge>}
                        {p.positioning && <Badge variant="neutral" className="text-[10px] px-1.5 py-0.5">Pos: {p.positioning}</Badge>}
                        {p.targetAudience && <Badge variant="neutral" className="text-[10px] px-1.5 py-0.5">Audience: {p.targetAudience}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPillarId(p.id);
                          setPillarForm({
                            name: p.name,
                            description: p.description || '',
                            tone: p.tone || '',
                            targetAudience: p.targetAudience || '',
                            cta: p.cta || '',
                            positioning: p.positioning || '',
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error hover:bg-error/10"
                        onClick={() => {
                          if (confirm('Delete this pillar?')) deletePillar.mutate(p.id);
                        }}
                        disabled={deletePillar.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {activeTab === 'voice' && (
          <Card>
            <CardHeader>
              <CardTitle>Voice Training</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Add example posts so AI can match your voice. Use at least 3–5 examples.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleVoiceSubmit} className="space-y-6">
                <div>
                  <span className="text-sm font-medium text-foreground block mb-3">Example type</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <RadioCard
                      label="My post"
                      description="A post you wrote that represents your style"
                      name="voiceSource"
                      value="own_post"
                      checked={voiceExampleSource === 'own_post'}
                      onChange={() => setVoiceExampleSource('own_post')}
                      icon={<Sparkles className="h-5 w-5" />}
                    />
                    <RadioCard
                      label="Reference"
                      description="A post from someone else you want to emulate"
                      name="voiceSource"
                      value="reference"
                      checked={voiceExampleSource === 'reference'}
                      onChange={() => setVoiceExampleSource('reference')}
                      icon={<Sparkles className="h-5 w-5" />}
                    />
                  </div>
                </div>
                <Textarea
                  label="Paste an example post (min 50 characters)"
                  value={voicePostText}
                  onChange={(e) => setVoicePostText(e.target.value)}
                  placeholder="Paste a LinkedIn post you’ve written that represents your voice…"
                  rows={5}
                />
                <Button
                  type="submit"
                  disabled={voicePostText.trim().length < 50 || addExample.isPending}
                  isLoading={addExample.isPending}
                  loadingText="Adding…"
                >
                  Add example
                </Button>
              </form>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Your examples</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => analyzeVoice.mutate()}
                    disabled={examples.length < 3 || analyzeVoice.isPending}
                    isLoading={analyzeVoice.isPending}
                    loadingText="Analyzing…"
                  >
                    Analyze voice
                  </Button>
                </div>
                {profile?.voiceConfidence != null && (
                  // Adjusted property name from voiceConfidenceScore to voiceConfidence as per type definition
                  <p className="text-xs text-muted-foreground mb-2">
                    Voice confidence: {profile.voiceConfidence}%
                  </p>
                )}
                <ul className="space-y-2">
                  {examples.length === 0 && (
                    <li className="text-sm text-muted-foreground">No examples yet.</li>
                  )}
                  {examples.slice(0, 10).map((ex: VoiceExample) => (
                    <li key={ex.id} className="flex items-start justify-between gap-2 p-3 rounded-lg bg-background">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-2">{ex.postText}</p>
                        {(ex as any).source === 'reference' && (
                          // Source might not be in VoiceExample type
                          <Badge variant="neutral" className="mt-1 text-xs">Reference</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-error shrink-0"
                        onClick={() => {
                          if (confirm('Remove this example?')) deleteExample.mutate(ex.id);
                        }}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
                {examples.length > 10 && (
                  <Link href="/voice" className="text-sm text-brand hover:underline mt-2 inline-block">
                    View all {examples.length} examples →
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'prompts' && (
          <Card>
            <CardHeader>
              <CardTitle>Prompt personalisation</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Default instructions for AI across research, classification, and draft generation. These are injected into prompts when set.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Default instructions for AI"
                value={defaultInstructions}
                onChange={(e) => setDefaultInstructions(e.target.value)}
                placeholder="e.g. Focus on B2B SaaS and avoid crypto. Prefer data and studies over opinions."
                rows={5}
                className="max-w-2xl"
              />
              <Button
                onClick={() =>
                  updateProfile.mutate(
                    { defaultInstructions: defaultInstructions.trim() || null },
                    { onSuccess: () => { } }
                  )
                }
                disabled={updateProfile.isPending}
                isLoading={updateProfile.isPending}
                loadingText="Saving…"
              >
                Save instructions
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'integrations' && (
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Connect sources for topic discovery and publish to LinkedIn.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <h4 className="font-medium text-foreground">Perplexity</h4>
                    <p className="text-sm text-muted-foreground">Auto-fetch trending topics and research</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integrations.perplexityEnabled}
                      onChange={(e) =>
                        setIntegrations((i) => ({ ...i, perplexityEnabled: e.target.checked }))
                      }
                      className="sr-only peer"
                      aria-label="Toggle Perplexity"
                    />
                    <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-brand after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <h4 className="font-medium text-foreground mb-2">Reddit</h4>
                  <p className="text-sm text-muted-foreground mb-3">Keywords to discover topics from Reddit</p>
                  <Input
                    value={integrations.redditKeywords}
                    onChange={(e) =>
                      setIntegrations((i) => ({ ...i, redditKeywords: e.target.value }))
                    }
                    placeholder="e.g. AI, startups, productivity"
                    className="max-w-md"
                  />
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <h4 className="font-medium text-foreground mb-2">LinkedIn</h4>
                  <p className="text-sm text-muted-foreground mb-3">Connect your account to schedule and publish posts</p>
                  <Button variant="secondary" size="sm">
                    Connect LinkedIn (OAuth)
                  </Button>
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); updateProfile.mutateAsync(accountData); }} className="space-y-4 pt-4 border-t border-border">
                <Input
                  label="LinkedIn profile URL"
                  value={accountData.linkedinUrl}
                  onChange={(e) => setAccountData((a) => ({ ...a, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
                <Input
                  label="LinkedIn headline"
                  value={accountData.linkedinHeadline}
                  onChange={(e) => setAccountData((a) => ({ ...a, linkedinHeadline: e.target.value }))}
                  placeholder="e.g. Engineering Leader | Building AI products"
                  maxLength={500}
                />
                <Textarea
                  label="LinkedIn summary (optional)"
                  value={accountData.linkedinSummary}
                  onChange={(e) => setAccountData((a) => ({ ...a, linkedinSummary: e.target.value }))}
                  placeholder="Short bio or summary from your LinkedIn profile — used to personalise research and drafts."
                  rows={3}
                  className="max-w-2xl"
                />
                <Input
                  label="Target audience"
                  value={accountData.targetAudience}
                  onChange={(e) => setAccountData((a) => ({ ...a, targetAudience: e.target.value }))}
                  placeholder="e.g. Tech founders"
                />
                <Button type="submit" isLoading={updateProfile.isPending} loadingText="Saving…">
                  Save profile
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'billing' && (
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Current plan and usage
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 rounded-xl bg-brand/5 border border-brand/20">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {subscription?.planName || 'Free'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {subscription?.status || 'Active'}
                    </p>
                  </div>
                  {subscription?.monthlyPostLimit != null && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-brand">{subscription.monthlyPostLimit}</div>
                      <div className="text-xs text-muted-foreground">posts / month</div>
                    </div>
                  )}
                </div>
                <Button variant="secondary" size="sm" className="mt-4">
                  Upgrade plan
                </Button>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-3">Usage</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Content pillars</span>
                    <span className="font-medium text-foreground">{pillars.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Voice examples</span>
                    <span className="font-medium text-foreground">{examples.length}</span>
                  </div>
                  {profile?.voiceConfidence != null && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Voice confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand rounded-full"
                            style={{ width: `${profile.voiceConfidence}%` }}
                          />
                        </div>
                        <span className="font-medium text-foreground w-8">{profile.voiceConfidence}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

