'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { useTopics } from '@/lib/hooks/use-topics';
import { usePillars } from '@/lib/hooks/use-pillars';

export default function TopicsPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'classified' | 'drafted' | 'approved'>('all');
  const [filterPillar, setFilterPillar] = useState<string>('all');
  const [minScore, setMinScore] = useState(70);

  // Fetch topics and pillars from APIs
  const { data: topicsData, isLoading: topicsLoading } = useTopics({ limit: 100 });
  const { data: pillarsData } = usePillars({ status: 'active' });

  const topics = topicsData?.data?.data || [];
  const pillars = pillarsData?.data?.data || [];

  // Client-side filtering
  const filteredTopics = useMemo(() => {
    return topics.filter((topic: any) => {
      if (filterStatus !== 'all' && topic.status !== filterStatus) return false;
      if (filterPillar !== 'all' && topic.pillarId !== filterPillar) return false;
      if (topic.aiScore < minScore) return false;
      return true;
    });
  }, [topics, filterStatus, filterPillar, minScore]);

  const getSourceBadge = (source: string) => {
    const variants: Record<string, 'brand' | 'warning' | 'neutral'> = {
      perplexity: 'brand',
      reddit: 'warning',
      manual: 'neutral',
      fireflies: 'neutral',
    };
    return variants[source] || 'neutral';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-charcoal">Topics</h1>
          <p className="text-charcoal-light mt-1">
            Classified content ready for post generation
          </p>
        </div>
        <Link href="/topics/new">
          <Button>+ Add Manual Topic</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="select"
              >
                <option value="all">All</option>
                <option value="classified">Classified</option>
                <option value="drafted">Drafted</option>
                <option value="approved">Approved</option>
              </select>
            </div>

            {/* Pillar Filter */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Pillar</label>
              <select
                value={filterPillar}
                onChange={(e) => setFilterPillar(e.target.value)}
                className="select"
              >
                <option value="all">All Pillars</option>
                {pillars.map((pillar: any) => (
                  <option key={pillar.id} value={pillar.id}>
                    {pillar.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Score Filter */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Min Score: {minScore}
              </label>
              <input
                type="range"
                min="70"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-brand"
              />
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-charcoal-light">
                Showing{' '}
                <span className="font-semibold text-charcoal">
                  {topicsLoading ? '...' : filteredTopics.length}
                </span>{' '}
                topics
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {topicsLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-charcoal-light">Loading topics...</p>
          </CardContent>
        </Card>
      )}

      {/* Topics Grid */}
      {!topicsLoading && filteredTopics.length > 0 && (
        <div className="grid gap-4">
          {filteredTopics.map((topic: any) => (
            <Link key={topic.id} href={`/topics/${topic.id}`}>
              <Card hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-charcoal leading-relaxed line-clamp-2 flex-1">
                      {topic.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getSourceBadge(topic.source)}>
                        {topic.source}
                      </Badge>
                      {topic.pillarName && (
                        <Badge variant="success">{topic.pillarName}</Badge>
                      )}
                      {topic.hookAngle && (
                        <Badge variant="neutral" className="capitalize">
                          {topic.hookAngle}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4 text-warning"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-semibold text-charcoal">
                          {topic.aiScore}
                        </span>
                      </div>

                      <span className="text-sm text-charcoal-light">
                        {new Date(topic.createdAt).toLocaleDateString()}
                      </span>

                      <svg
                        className="w-5 h-5 text-charcoal-light"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!topicsLoading && filteredTopics.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="p-12 text-center">
            <svg
              className="w-16 h-16 text-charcoal-light/40 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="font-medium text-charcoal mb-2">No topics found</p>
            <p className="text-charcoal-light text-sm mb-6">
              Try adjusting your filters or add your first topic manually
            </p>
            <Link href="/topics/new">
              <Button>Add Manual Topic</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
