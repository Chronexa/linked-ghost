'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { useTopic, useGenerateDrafts } from '@/lib/hooks/use-topics';

const getSourceBadge = (source: string) => {
  const variants = {
    perplexity: 'brand',
    reddit: 'warning',
    manual: 'neutral',
  } as const;
  return variants[source as keyof typeof variants] || 'neutral';
};

export default function TopicDetailPage() {
  const params = useParams() as { id: string };
  const topicId = params.id;
  const [isGenerating, setIsGenerating] = useState(false);

  const { data, isLoading, refetch } = useTopic(topicId);
  const generateDrafts = useGenerateDrafts();

  const payload: any = data?.data;
  const topic = payload?.topic;
  const drafts = payload?.drafts || [];

  const handleGenerate = async () => {
    if (!topicId) return;
    setIsGenerating(true);
    try {
      if (!topicId) return;
      await generateDrafts.mutateAsync({
        topicId,
        userPerspective: "", // Default empty perspective for direct generation
      });
      await refetch();
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || !topic) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-charcoal-light">Loading topic...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Back Button */}
      <Link
        href="/topics"
        className="inline-flex items-center text-charcoal-light hover:text-charcoal mb-6 transition font-medium"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Topics
      </Link>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Topic Details */}
        <div className="space-y-6">
          <Card className="border border-border/60 shadow-warm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Topic Details</CardTitle>
                <div className="flex items-center space-x-1">
                  <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-2xl font-bold text-charcoal">{topic.aiScore}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-charcoal-light">Content</label>
                  <p className="text-charcoal leading-relaxed mt-2">{topic.content}</p>
                </div>

                {topic.sourceUrl && (
                  <div>
                    <label className="text-sm font-medium text-charcoal-light">Source URL</label>
                    <a
                      href={topic.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-text hover:text-brand text-sm mt-1 block truncate"
                    >
                      {topic.sourceUrl}
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div>
                    <label className="text-sm font-medium text-charcoal-light">Source</label>
                    <div className="mt-2">
                      <Badge variant={getSourceBadge(topic.source)}>
                        {topic.source}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-charcoal-light">Pillar</label>
                    <div className="mt-2">
                      <Badge variant="success">{topic.pillarName}</Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-charcoal-light">Hook Angle</label>
                    <div className="mt-2 text-sm text-charcoal font-medium capitalize">
                      {topic.hookAngle}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Reasoning */}
          <Card className="bg-brand/5 border-brand/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <svg
                  className="w-5 h-5 text-brand flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-brand-text mb-1">
                    AI Classification Reasoning
                  </p>
                  <p className="text-sm text-charcoal-light">{topic.reasoning}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Generate Drafts */}
        <div>
          {drafts.length === 0 ? (
            <Card className="border border-border/60 shadow-warm h-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-bold text-charcoal mb-3">
                  Ready to generate posts?
                </h3>
                <p className="text-charcoal-light mb-6">
                  Click below to generate 3 unique post variants in your voice
                </p>
                <Button
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  loadingText="Generating..."
                  variant="success"
                  size="lg"
                  className="px-8"
                >
                  Generate 3 Variants
                </Button>
                <p className="text-sm text-charcoal-light mt-3">
                  Estimated time: 10-15 seconds
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-bold text-charcoal">Generated Drafts</h3>
                <button
                  onClick={handleGenerate}
                  className="text-sm text-brand-text hover:text-brand font-medium"
                >
                  ↻ Regenerate All
                </button>
              </div>

              {drafts.map((draft: any) => (
                <Card key={draft.id} className="group hover:shadow-warm transition-all duration-300 border-border/60">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                          <span className="text-white font-display font-bold text-sm">
                            {draft.variantLetter}
                          </span>
                        </div>
                        <CardTitle className="text-base">Variant {draft.variantLetter}</CardTitle>
                      </div>
                      <span className="text-xs text-charcoal-light">{draft.characterCount} characters</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-charcoal-light leading-relaxed text-sm whitespace-pre-wrap line-clamp-4 mb-4">
                      {draft.fullText}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <button className="text-sm text-charcoal-light hover:text-brand font-medium transition">
                        ↻ Regenerate
                      </button>
                      <div className="flex items-center space-x-2">
                        <Link href={`/drafts/${draft.id}`}>
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button size="sm">
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
