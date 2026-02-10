'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { useTopics, useGenerateDrafts } from '@/lib/hooks/use-topics';
import { useDrafts, useApproveDraft } from '@/lib/hooks/use-drafts';
import { useUser } from '@/lib/hooks/use-user';
import toast from 'react-hot-toast';

const getSourceBadge = (source: string) => {
  const variants: Record<string, 'brand' | 'warning' | 'neutral'> = {
    perplexity: 'brand',
    reddit: 'warning',
    manual: 'neutral',
    fireflies: 'neutral',
  };
  return variants[source] || 'neutral';
};

export default function Dashboard() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  // Fetch data from APIs
  const { data: userData, isLoading: userLoading } = useUser();
  const { data: topicsData, isLoading: topicsLoading } = useTopics({ status: 'classified', limit: 5 });
  const { data: draftsData, isLoading: draftsLoading } = useDrafts({ status: 'draft', limit: 3 });
  
  const generateDrafts = useGenerateDrafts();
  const approveDraft = useApproveDraft();

  const topics = topicsData?.data?.data || [];
  const drafts = draftsData?.data?.data || [];
  const user = userData?.data?.user;
  const profile = userData?.data?.profile;

  const handleGenerate = async (topicId: string) => {
    setSelectedTopic(topicId);
    try {
      await generateDrafts.mutateAsync(topicId);
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleApprove = async (draftId: string) => {
    try {
      await approveDraft.mutateAsync(draftId);
    } catch (error) {
      // Error already handled by hook
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charcoal mb-2">
          Welcome back{user?.fullName ? `, ${user.fullName}` : ''}!
        </h1>
        <p className="text-charcoal-light">
          {topicsLoading || draftsLoading ? (
            <span>Loading...</span>
          ) : (
            <>
              You have <span className="font-semibold text-brand">{topics.length} topics</span> pending and{' '}
              <span className="font-semibold text-success">{drafts.length} drafts</span> ready to review.
            </>
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-brand mb-1">
              {topicsLoading ? '...' : topics.length}
            </div>
            <div className="text-sm text-charcoal-light">Pending Topics</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-success mb-1">
              {draftsLoading ? '...' : drafts.length}
            </div>
            <div className="text-sm text-charcoal-light">Generated Drafts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-charcoal mb-1">
              {userLoading ? '...' : user?.pillarsCount || 0}
            </div>
            <div className="text-sm text-charcoal-light">Content Pillars</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-charcoal mb-1">
              {userLoading ? '...' : profile?.voiceConfidenceScore || 0}%
            </div>
            <div className="text-sm text-charcoal-light">Voice Confidence</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column - Pending Topics (40%) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-charcoal">
              Pending Topics
            </h2>
            <Link href="/topics">
              <Button variant="ghost" size="sm">
                View All →
              </Button>
            </Link>
          </div>

          {topicsLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-charcoal-light">Loading topics...</p>
              </CardContent>
            </Card>
          ) : topics.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-charcoal-light mb-4">No topics yet</p>
                <Link href="/topics/new">
                  <Button>Add Your First Topic</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            topics.map((topic: any) => (
              <Card
                key={topic.id}
                hover
                className={selectedTopic === topic.id ? 'ring-2 ring-brand' : ''}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm text-charcoal leading-relaxed flex-1 line-clamp-2">
                      {topic.content}
                    </p>
                    <div className="flex items-center ml-2">
                      <svg
                        className="w-4 h-4 text-warning mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-semibold text-charcoal">
                        {topic.aiScore}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSourceBadge(topic.source)}>
                        {topic.source}
                      </Badge>
                      <Badge variant="success">{topic.pillarName}</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleGenerate(topic.id)}
                      disabled={generateDrafts.isPending && selectedTopic === topic.id}
                    >
                      {generateDrafts.isPending && selectedTopic === topic.id
                        ? 'Generating...'
                        : 'Generate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right Column - Generated Drafts (60%) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-charcoal">
              Generated Drafts
            </h2>
            <Link href="/drafts">
              <Button variant="ghost" size="sm">
                View All →
              </Button>
            </Link>
          </div>

          {draftsLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-charcoal-light">Loading drafts...</p>
              </CardContent>
            </Card>
          ) : drafts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-charcoal-light mb-4">No drafts yet</p>
                <p className="text-sm text-charcoal-light">
                  Generate your first post by clicking "Generate" on a topic
                </p>
              </CardContent>
            </Card>
          ) : (
            drafts.map((draft: any) => (
              <Card key={draft.id} hover>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                        <span className="text-white font-display font-bold text-sm">
                          {draft.variantLetter}
                        </span>
                      </div>
                      <CardTitle className="text-base">
                        Variant {draft.variantLetter}
                      </CardTitle>
                    </div>
                    <span className="text-xs text-charcoal-light">
                      {draft.characterCount} chars
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-charcoal-light leading-relaxed line-clamp-3 mb-4">
                    {draft.fullText}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Link href={`/drafts/${draft.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleApprove(draft.id)}
                      disabled={approveDraft.isPending}
                    >
                      {approveDraft.isPending ? 'Approving...' : 'Approve'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <Card className="mt-8">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <span className="text-charcoal-light">
                <span className="font-semibold text-brand">
                  {topicsLoading ? '...' : topics.length}
                </span>{' '}
                topics pending
              </span>
              <span className="text-charcoal-light">
                <span className="font-semibold text-success">
                  {draftsLoading ? '...' : drafts.length}
                </span>{' '}
                drafts ready
              </span>
              {profile?.lastVoiceTrainingAt && (
                <span className="text-charcoal-light">
                  Voice trained:{' '}
                  <span className="font-medium text-charcoal">
                    {new Date(profile.lastVoiceTrainingAt).toLocaleDateString()}
                  </span>
                </span>
              )}
            </div>
            <span className="text-charcoal-light">
              Status: <span className="font-medium text-success">All systems operational</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
