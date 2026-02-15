'use client';

import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { useAnalytics } from '@/lib/hooks/use-analytics';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();
  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-charcoal mb-2">Analytics</h1>
        <p className="text-charcoal-light mb-8">Loading analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl font-bold text-charcoal mb-2">Analytics</h1>
        <p className="text-charcoal-light">Unable to load analytics. Please try again.</p>
      </div>
    );
  }

  const {
    totalDrafts,
    draftsThisMonth,
    approvedOrPosted,
    avgScore,
    topPillar,
    topPillarPosts,
    pillarStats = [],
    recentDrafts = [],
  } = stats;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charcoal">Analytics</h1>
        <p className="text-charcoal-light mt-1">
          Track your content performance and insights
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-charcoal-light mb-1">Total Drafts</div>
            <div className="text-3xl font-bold text-charcoal">{totalDrafts}</div>
            <div className="text-xs text-success mt-2 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {draftsThisMonth} this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-charcoal-light mb-1">This Month</div>
            <div className="text-3xl font-bold text-brand">{draftsThisMonth}</div>
            <div className="text-xs text-charcoal-light mt-2">
              Drafts created
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-charcoal-light mb-1">Avg Engagement (est.)</div>
            <div className="text-3xl font-bold text-success">
              {avgScore != null ? avgScore : '—'}
            </div>
            <div className="text-xs text-charcoal-light mt-2">Across all drafts</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-charcoal-light mb-1">Top Pillar</div>
            <div className="text-xl font-bold text-charcoal truncate">{topPillar}</div>
            <div className="text-xs text-charcoal-light mt-2">{topPillarPosts} drafts</div>
          </CardContent>
        </Card>
      </div>

      {/* Pillar Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Content by Pillar</CardTitle>
        </CardHeader>
        <CardContent>
          {pillarStats.length === 0 ? (
            <p className="text-charcoal-light text-sm">No drafts by pillar yet. Generate drafts from topics to see distribution.</p>
          ) : (
            <div className="space-y-4">
              {pillarStats.map((pillar: { name: string; posts: number; avgScore: number | null; percentage: number }) => (
                <div key={pillar.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-charcoal">{pillar.name}</span>
                      {pillar.avgScore != null && (
                        <Badge variant="neutral">{pillar.avgScore} avg engagement</Badge>
                      )}
                    </div>
                    <div className="text-sm text-charcoal-light">
                      <span className="font-semibold text-charcoal">{pillar.posts}</span> posts
                      {pillar.percentage > 0 && ` (${pillar.percentage}%)`}
                    </div>
                  </div>
                  <div className="bg-border rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand h-full rounded-full transition-all duration-500"
                      style={{ width: `${pillar.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Drafts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentDrafts.length === 0 ? (
            <p className="text-charcoal-light text-sm">No drafts yet. Create topics and generate drafts to see them here.</p>
          ) : (
            <div className="space-y-4">
              {recentDrafts.map((post: { id: string; text: string; pillar: string | null; date: string | null; score: number | null }) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex-1">
                    <Link href={`/drafts/${post.id}`} className="block hover:opacity-80">
                      <p className="text-charcoal text-sm line-clamp-1">{post.text}</p>
                    </Link>
                    <div className="flex items-center space-x-3 mt-1">
                      {post.date && (
                        <span className="text-xs text-charcoal-light">{post.date}</span>
                      )}
                      {post.pillar && (
                        <Badge variant="success" className="text-xs">
                          {post.pillar}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center ml-4">
                    {post.score != null && (
                      <>
                        <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm font-semibold text-charcoal">{post.score}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
