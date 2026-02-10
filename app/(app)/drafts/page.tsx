'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { useDrafts, useApproveDraft } from '@/lib/hooks/use-drafts';
import { usePillars } from '@/lib/hooks/use-pillars';
import { formatRelativeTime } from '@/lib/utils';

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
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'draft' | 'approved' | 'scheduled' | 'posted'
  >('all');
  const [filterPillar, setFilterPillar] = useState<string>('all');

  // Fetch drafts and pillars from APIs
  const { data: draftsData, isLoading: draftsLoading } = useDrafts({ limit: 100 });
  const { data: pillarsData } = usePillars({ status: 'active' });
  const approveDraft = useApproveDraft();

  const drafts = draftsData?.data?.data || [];
  const pillars = pillarsData?.data?.data || [];

  // Client-side filtering
  const filteredDrafts = useMemo(() => {
    return drafts.filter((draft: any) => {
      if (filterStatus !== 'all' && draft.status !== filterStatus) return false;
      if (filterPillar !== 'all' && draft.pillarId !== filterPillar) return false;
      return true;
    });
  }, [drafts, filterStatus, filterPillar]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return {
      draft: drafts.filter((d: any) => d.status === 'draft').length,
      approved: drafts.filter((d: any) => d.status === 'approved').length,
      scheduled: drafts.filter((d: any) => d.status === 'scheduled').length,
      posted: drafts.filter((d: any) => d.status === 'posted').length,
    };
  }, [drafts]);

  const handleApprove = async (id: string) => {
    try {
      await approveDraft.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charcoal">Drafts</h1>
        <p className="text-charcoal-light mt-1">Manage your generated LinkedIn posts</p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-charcoal">
              {draftsLoading ? '...' : statusCounts.draft}
            </div>
            <div className="text-sm text-charcoal-light">Drafts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {draftsLoading ? '...' : statusCounts.approved}
            </div>
            <div className="text-sm text-charcoal-light">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-brand">
              {draftsLoading ? '...' : statusCounts.scheduled}
            </div>
            <div className="text-sm text-charcoal-light">Scheduled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-charcoal">
              {draftsLoading ? '...' : statusCounts.posted}
            </div>
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
                {pillars.map((pillar: any) => (
                  <option key={pillar.id} value={pillar.id}>
                    {pillar.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-charcoal-light">
                Showing{' '}
                <span className="font-semibold text-charcoal">
                  {draftsLoading ? '...' : filteredDrafts.length}
                </span>{' '}
                drafts
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {draftsLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-charcoal-light">Loading drafts...</p>
          </CardContent>
        </Card>
      )}

      {/* Drafts List */}
      {!draftsLoading && filteredDrafts.length > 0 && (
        <div className="grid gap-4">
          {filteredDrafts.map((draft: any) => (
            <Card key={draft.id} hover>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                      <span className="text-white font-display font-bold text-sm">
                        {draft.variantLetter}
                      </span>
                    </div>
                    {draft.pillarName && <Badge variant="success">{draft.pillarName}</Badge>}
                    <Badge variant={getStatusBadge(draft.status)} className="capitalize">
                      {draft.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-charcoal-light">
                    {draft.characterCount} chars
                  </span>
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
                      <span>
                        Scheduled for {new Date(draft.scheduledFor).toLocaleDateString()}
                      </span>
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
                      <Button
                        size="sm"
                        onClick={() => handleApprove(draft.id)}
                        disabled={approveDraft.isPending}
                      >
                        {approveDraft.isPending ? 'Approving...' : 'Approve'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!draftsLoading && filteredDrafts.length === 0 && (
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
