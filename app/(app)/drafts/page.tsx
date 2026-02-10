'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';

// Mock data
const mockDrafts = [
  {
    id: '1',
    topicId: 't1',
    variantLetter: 'A',
    fullText:
      "AI agents aren't just the future—they're already here, revolutionizing customer service.\n\nCompanies using AI-powered support are seeing response times drop by 60%.",
    characterCount: 847,
    status: 'draft' as const,
    pillarName: 'AI Innovation',
    createdAt: '2026-02-09T08:30:00Z',
  },
  {
    id: '2',
    topicId: 't2',
    variantLetter: 'B',
    fullText:
      'Remote work is changing how we build culture. Here are 5 lessons from managing distributed teams for 3 years...',
    characterCount: 923,
    status: 'approved' as const,
    pillarName: 'Leadership',
    createdAt: '2026-02-08T14:20:00Z',
    approvedAt: '2026-02-09T09:15:00Z',
  },
  {
    id: '3',
    topicId: 't3',
    variantLetter: 'C',
    fullText:
      'Productivity isn\'t about working harder. It\'s about working smarter. A new study shows 70% increase with AI tools...',
    characterCount: 891,
    status: 'scheduled' as const,
    pillarName: 'Productivity',
    createdAt: '2026-02-07T10:00:00Z',
    scheduledFor: '2026-02-10T14:00:00Z',
  },
  {
    id: '4',
    topicId: 't4',
    variantLetter: 'A',
    fullText: 'The no-code revolution is here. Small teams are now building what used to require engineering teams...',
    characterCount: 756,
    status: 'posted' as const,
    pillarName: 'Tech Trends',
    createdAt: '2026-02-06T12:00:00Z',
    postedAt: '2026-02-08T15:00:00Z',
  },
];

const getStatusBadge = (status: string) => {
  const variants = {
    draft: 'neutral',
    approved: 'success',
    scheduled: 'brand',
    posted: 'neutral',
  } as const;
  return variants[status as keyof typeof variants] || 'neutral';
};

export default function DraftsPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'approved' | 'scheduled' | 'posted'>('all');
  const [filterPillar, setFilterPillar] = useState<string>('all');

  const filteredDrafts = mockDrafts.filter((draft) => {
    if (filterStatus !== 'all' && draft.status !== filterStatus) return false;
    if (filterPillar !== 'all' && draft.pillarName !== filterPillar) return false;
    return true;
  });

  const pillars = Array.from(new Set(mockDrafts.map((d) => d.pillarName)));

  const statusCounts = {
    draft: mockDrafts.filter((d) => d.status === 'draft').length,
    approved: mockDrafts.filter((d) => d.status === 'approved').length,
    scheduled: mockDrafts.filter((d) => d.status === 'scheduled').length,
    posted: mockDrafts.filter((d) => d.status === 'posted').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charcoal">Drafts</h1>
        <p className="text-charcoal-light mt-1">
          Manage your generated LinkedIn posts
        </p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-charcoal">{statusCounts.draft}</div>
            <div className="text-sm text-charcoal-light">Drafts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">{statusCounts.approved}</div>
            <div className="text-sm text-charcoal-light">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-brand">{statusCounts.scheduled}</div>
            <div className="text-sm text-charcoal-light">Scheduled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-charcoal">{statusCounts.posted}</div>
            <div className="text-sm text-charcoal-light">Posted</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="select"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="scheduled">Scheduled</option>
                <option value="posted">Posted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Pillar</label>
              <select
                value={filterPillar}
                onChange={(e) => setFilterPillar(e.target.value)}
                className="select"
              >
                <option value="all">All Pillars</option>
                {pillars.map((pillar) => (
                  <option key={pillar} value={pillar}>
                    {pillar}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-charcoal-light">
                Showing <span className="font-semibold text-charcoal">{filteredDrafts.length}</span> drafts
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drafts List */}
      <div className="grid gap-4">
        {filteredDrafts.map((draft) => (
          <Card key={draft.id} hover>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                    <span className="text-white font-display font-bold text-sm">
                      {draft.variantLetter}
                    </span>
                  </div>
                  <Badge variant="success">
                    {draft.pillarName}
                  </Badge>
                  <Badge variant={getStatusBadge(draft.status)} className="capitalize">
                    {draft.status}
                  </Badge>
                </div>
                <span className="text-xs text-charcoal-light">{draft.characterCount} chars</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-charcoal-light leading-relaxed text-sm line-clamp-3 mb-4">
                {draft.fullText}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="text-xs text-charcoal-light">
                  {draft.status === 'posted' && draft.postedAt && (
                    <span>Posted {formatRelativeTime(draft.postedAt)}</span>
                  )}
                  {draft.status === 'scheduled' && draft.scheduledFor && (
                    <span>Scheduled for {new Date(draft.scheduledFor).toLocaleDateString()}</span>
                  )}
                  {draft.status === 'approved' && draft.approvedAt && (
                    <span>Approved {formatRelativeTime(draft.approvedAt)}</span>
                  )}
                  {draft.status === 'draft' && (
                    <span>Created {formatRelativeTime(draft.createdAt)}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/drafts/${draft.id}`}>
                    <Button variant="secondary" size="sm">
                      {draft.status === 'draft' ? 'Edit' : 'View'}
                    </Button>
                  </Link>
                  {draft.status === 'draft' && (
                    <Button size="sm">
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredDrafts.length === 0 && (
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
            <p className="font-medium text-charcoal mb-2">No drafts found</p>
            <p className="text-charcoal-light text-sm mb-6">
              Generate your first post from the Topics page
            </p>
            <Link href="/topics">
              <Button>Browse Topics</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
