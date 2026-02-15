'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardContent, Input, Textarea } from '@/components/ui';
import { usePillars } from '@/lib/hooks/use-pillars';
import { useCreateTopic, useClassifyTopic } from '@/lib/hooks/use-topics';

export default function NewTopicPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    url: '',
    pillarId: '',
  });

  // Load real pillars for the current user
  const { data: pillarsData, isLoading: pillarsLoading } = usePillars({ status: 'active' });
  const pillars = pillarsData?.data?.data || [];

  const createTopic = useCreateTopic();
  const classifyTopic = useClassifyTopic();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.content.trim().length < 50) {
      return;
    }

    setIsSubmitting(true);

    try {
      // If user selected a pillar, create a classified topic directly
      if (formData.pillarId) {
        await createTopic.mutateAsync({
          content: formData.content,
          sourceUrl: formData.url || undefined,
          pillarId: formData.pillarId,
        });
        router.push('/topics');
        return;
      }

      // Otherwise, create a raw topic and immediately classify it
      const result: any = await createTopic.mutateAsync({
        content: formData.content,
        sourceUrl: formData.url || undefined,
      });

      const rawTopic = result?.data;
      if (rawTopic && rawTopic.id) {
        await classifyTopic.mutateAsync({
          rawTopicId: rawTopic.id,
          topicContent: rawTopic.content,
          sourceUrl: rawTopic.sourceUrl || undefined,
          autoApprove: true,
        } as any);
      }

      router.push('/topics');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
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

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-charcoal tracking-tight">Add Manual Topic</h1>
        <p className="text-charcoal-light mt-3 text-lg leading-relaxed">
          Add a custom topic or news item to generate posts from
        </p>
      </div>

      {/* Form */}
      <Card className="border border-border/60 shadow-warm bg-surface/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea
              label="Topic Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Paste or write the topic content, news, or insight you want to create a post about..."
              rows={8}
              required
              helperText={`${formData.content.length} characters • Minimum 50 characters`}
            />

            <Input
              label="Source URL (optional)"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/article"
              helperText="Add a reference URL if this topic came from an article or source"
            />

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Suggested Content Pillar (optional)
              </label>
              <select
                value={formData.pillarId}
                onChange={(e) => setFormData({ ...formData, pillarId: e.target.value })}
                className="select"
              >
                <option value="">Let AI classify automatically</option>
                {pillars.map((pillar: any) => (
                  <option key={pillar.id} value={pillar.id}>
                    {pillar.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-charcoal-light mt-2">
                AI will classify this automatically if you don&apos;t select a pillar
              </p>
            </div>

            <Card className="bg-brand/5 border-brand/20 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-charcoal-light leading-relaxed">
                  <span className="font-semibold text-brand-text">ℹ️ How it works:</span> Once submitted, AI will
                  analyze this topic, assign it a quality score, suggest a hook angle, and classify it
                  under a content pillar. You can then generate post variants from it.
                </p>
              </CardContent>
            </Card>

            <div className="flex items-center space-x-3 pt-4">
              <Button
                type="submit"
                isLoading={isSubmitting}
                loadingText="Analyzing & Classifying..."
                disabled={formData.content.length < 50}
                className="flex-1"
              >
                Add Topic
              </Button>
              <Link href="/topics" className="flex-1">
                <Button type="button" variant="secondary" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-8 bg-surface border border-border/60 shadow-sm">
        <CardContent className="p-8">
          <h3 className="font-semibold text-charcoal mb-4">💡 Tips for great topics</h3>
          <ul className="space-y-3 text-sm text-charcoal-light">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-success mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Include data, statistics, or specific examples when possible
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-success mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Focus on insights and actionable information
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-success mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Make sure the topic aligns with your content pillars
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-success mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Avoid overly promotional or sales-focused content
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
