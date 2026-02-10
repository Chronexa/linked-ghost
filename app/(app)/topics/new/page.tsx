'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardContent, Input, Textarea } from '@/components/ui';

export default function NewTopicPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    url: '',
    pillarId: '',
  });

  const pillars = [
    { id: '1', name: 'AI Innovation' },
    { id: '2', name: 'Leadership' },
    { id: '3', name: 'Productivity' },
    { id: '4', name: 'Founder Journey' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/topics');
    }, 2000);
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
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charcoal">Add Manual Topic</h1>
        <p className="text-charcoal-light mt-2">
          Add a custom topic or news item to generate posts from
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
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
                {pillars.map((pillar) => (
                  <option key={pillar.id} value={pillar.id}>
                    {pillar.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-charcoal-light mt-2">
                AI will classify this automatically if you don&apos;t select a pillar
              </p>
            </div>

            <Card className="bg-brand/5 border-brand/20">
              <CardContent className="p-4">
                <p className="text-sm text-charcoal-light">
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
      <Card className="mt-8 bg-background">
        <CardContent className="p-6">
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
