'use client';

import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';

export default function AnalyticsPage() {
  // Mock data
  const stats = {
    totalPosts: 24,
    postsThisMonth: 12,
    avgScore: 87,
    topPillar: 'AI Innovation',
  };

  const pillarStats = [
    { name: 'AI Innovation', posts: 12, avgScore: 92, percentage: 50 },
    { name: 'Leadership', posts: 8, avgScore: 85, percentage: 33 },
    { name: 'Productivity', posts: 4, avgScore: 88, percentage: 17 },
  ];

  const recentPosts = [
    {
      id: '1',
      text: "AI agents aren't just the future—they're already here...",
      pillar: 'AI Innovation',
      date: '2026-02-09',
      score: 92,
    },
    {
      id: '2',
      text: 'Remote work is changing how we build culture...',
      pillar: 'Leadership',
      date: '2026-02-08',
      score: 85,
    },
    {
      id: '3',
      text: "Productivity isn't about working harder...",
      pillar: 'Productivity',
      date: '2026-02-07',
      score: 88,
    },
  ];

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
            <div className="text-sm font-medium text-charcoal-light mb-1">Total Posts</div>
            <div className="text-3xl font-bold text-charcoal">{stats.totalPosts}</div>
            <div className="text-xs text-success mt-2 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              12 this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-charcoal-light mb-1">This Month</div>
            <div className="text-3xl font-bold text-brand">{stats.postsThisMonth}</div>
            <div className="text-xs text-charcoal-light mt-2">67% of monthly goal</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-charcoal-light mb-1">Avg AI Score</div>
            <div className="text-3xl font-bold text-success">{stats.avgScore}</div>
            <div className="text-xs text-charcoal-light mt-2">High quality</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-charcoal-light mb-1">Top Pillar</div>
            <div className="text-xl font-bold text-charcoal truncate">{stats.topPillar}</div>
            <div className="text-xs text-charcoal-light mt-2">12 posts</div>
          </CardContent>
        </Card>
      </div>

      {/* Pillar Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Content by Pillar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pillarStats.map((pillar) => (
              <div key={pillar.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-charcoal">{pillar.name}</span>
                    <Badge variant="neutral">{pillar.avgScore} avg score</Badge>
                  </div>
                  <div className="text-sm text-charcoal-light">
                    <span className="font-semibold text-charcoal">{pillar.posts}</span> posts ({pillar.percentage}%)
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
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex-1">
                  <p className="text-charcoal text-sm line-clamp-1">{post.text}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-charcoal-light">{post.date}</span>
                    <Badge variant="success" className="text-xs">
                      {post.pillar}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center ml-4">
                  <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-sm font-semibold text-charcoal">{post.score}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
