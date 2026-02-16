'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, Badge } from '@/components/ui';
import { Select } from '@/components/ui/select-custom';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText, CheckCircle2, Calendar, Send } from 'lucide-react';
import { useDrafts, useApproveDraft } from '@/lib/hooks/use-drafts';
import { usePillars } from '@/lib/hooks/use-pillars';
import { formatRelativeTime } from '@/lib/utils';
import { Draft, Pillar } from '@/types';

// Define the response structure if not exported from hooks (or cast to unknown first)
// Ideally hooks should return typed data.
// Based on usage: draftsData is ApiResponse<PaginatedResponse<Draft>> or similar
// Inspecting previous code: (draftsData as any)?.data ?? (draftsData as any)?.data?.data
// usage elsewhere implies draftsData IS the response, and .data IS the payload.

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
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPillar, setFilterPillar] = useState<string>('all');

  // Fetch drafts and pillars from APIs
  const { data: draftsDataResponse, isLoading: draftsLoading } = useDrafts({ limit: 100 });
  const { data: pillarsDataResponse } = usePillars({ status: 'active' });
  const approveDraft = useApproveDraft();

  // Safely extract data with type assertions for now, assuming hook response structure
  // In a full refactor, useDrafts should return Draft[] directly or a typed response.
  const drafts = useMemo(() => {
    // Check if draftsDataResponse is valid and has data
    if (!draftsDataResponse) return [] as Draft[];
    // Handle potential nesting (ApiResponse wrapping PaginatedResponse or array)
    // Adjust based on actual API response structure observed in logs/previous code
    // Pattern seen: data?.data (if paginated response inside api response) or data (if direct array inside api response)
    const payload = (draftsDataResponse as any).data;
    if (Array.isArray(payload)) return payload as Draft[];
    if (payload?.data && Array.isArray(payload.data)) return payload.data as Draft[];
    return [] as Draft[];
  }, [draftsDataResponse]);

  const pillars = useMemo(() => {
    if (!pillarsDataResponse) return [] as Pillar[];
    const payload = (pillarsDataResponse as any).data;
    if (Array.isArray(payload)) return payload as Pillar[];
    return [] as Pillar[];
  }, [pillarsDataResponse]);

  // Client-side filtering
  const filteredDrafts = useMemo(() => {
    return drafts.filter((draft: Draft) => {
      // cast status to string for comparison if needed, or update Draft type
      if (filterStatus !== 'all' && draft.status !== filterStatus) return false;
      if (filterPillar !== 'all' && getDraftPillarId(draft) !== filterPillar) return false;
      return true;
    });
  }, [drafts, filterStatus, filterPillar]);

  // Helper to safely get pillarId (it might be on the draft object directly)
  // Type definition says `topicId` but schema has `pillarId`. 
  // Let's assume the component was working meaning `pillarId` exists on the object even if type definition is missing it.
  // We should update the type definition later. For now, we cast.
  function getDraftPillarId(draft: Draft): string | undefined {
    return (draft as any).pillarId;
  }

  function getDraftPillarName(draft: Draft): string | undefined {
    return (draft as any).pillarName;
  }

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return {
      draft: drafts.filter((d) => d.status === 'draft').length,
      approved: drafts.filter((d) => d.status === 'approved').length,
      scheduled: drafts.filter((d) => d.status === 'scheduled').length,
      posted: drafts.filter((d) => d.status === 'posted').length,
    };
  }, [drafts]);

  const handleApprove = async (id: string) => {
    try {
      await approveDraft.mutateAsync(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Approved', value: 'approved' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Posted', value: 'posted' },
  ];

  const pillarOptions = [
    { label: 'All Pillars', value: 'all' },
    ...pillars.map((p) => ({ label: p.name, value: p.id })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Drafts</h1>
          <p className="text-muted-foreground mt-1">Manage your generated LinkedIn posts</p>
        </div>
      </div>

      {/* Stats Bar */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          <div className="p-4 lg:p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Drafts</p>
              <p className="text-2xl font-bold text-foreground">{draftsLoading ? '-' : statusCounts.draft}</p>
            </div>
          </div>
          <div className="p-4 lg:p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-foreground">{draftsLoading ? '-' : statusCounts.approved}</p>
            </div>
          </div>
          <div className="p-4 lg:p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-bold text-foreground">{draftsLoading ? '-' : statusCounts.scheduled}</p>
            </div>
          </div>
          <div className="p-4 lg:p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Posted</p>
              <p className="text-2xl font-bold text-foreground">{draftsLoading ? '-' : statusCounts.posted}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="w-full sm:w-[180px]">
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              options={statusOptions}
            />
          </div>
          <div className="w-full sm:w-[200px]">
            <Select
              value={filterPillar}
              onChange={setFilterPillar}
              options={pillarOptions}
              placeholder="Select Pillar"
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{draftsLoading ? '...' : filteredDrafts.length}</span> drafts
        </div>
      </div>

      {/* Loading State */}
      {draftsLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      )}

      {/* Drafts List */}
      {!draftsLoading && filteredDrafts.length > 0 && (
        <div className="grid gap-4">
          {filteredDrafts.map((draft: Draft) => (
            <Card key={draft.id} hover className="group transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-brand/10 text-brand rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <span className="font-display font-bold text-sm">
                        {draft.variantLetter}
                      </span>
                    </div>
                    {getDraftPillarName(draft) && (
                      <Badge variant="outline" className="text-muted-foreground border-border bg-transparent">
                        {getDraftPillarName(draft)}
                      </Badge>
                    )}
                    <Badge variant={getStatusBadge(draft.status)} className="capitalize">
                      {draft.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {draft.characterCount} chars
                    </span>
                    {draft.qualityWarnings?.length ? (
                      <Badge variant="warning" title={draft.qualityWarnings.join(' • ')}>
                        Needs editing
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-sm line-clamp-3 mb-4 group-hover:text-foreground transition-colors">
                  {draft.fullText}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
                  <div className="text-xs text-muted-foreground">
                    {draft.status === 'posted' && draft.postedAt && (
                      <span className="flex items-center gap-1"><Send className="h-3 w-3" /> Posted {formatRelativeTime(draft.postedAt)}</span>
                    )}
                    {draft.status === 'scheduled' && draft.scheduledFor && (
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Scheduled {new Date(draft.scheduledFor).toLocaleDateString()}</span>
                    )}
                    {draft.status === 'approved' && draft.approvedAt && (
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Approved {formatRelativeTime(draft.approvedAt)}</span>
                    )}
                    {draft.status === 'draft' && (
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Created {formatRelativeTime(draft.createdAt)}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {draft.status === 'draft' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-success/10 hover:text-success"
                        onClick={(e) => {
                          e.preventDefault();
                          handleApprove(draft.id);
                        }}
                        disabled={approveDraft.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        {approveDraft.isPending ? 'Approving...' : 'Approve'}
                      </Button>
                    )}
                    <Link href={`/drafts/${draft.id}`}>
                      <Button variant="secondary" size="sm">
                        {draft.status === 'draft' ? 'Edit' : 'View'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!draftsLoading && filteredDrafts.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No drafts found"
          description={filterStatus !== 'all' ? "No drafts match your filters." : "You haven't generated any drafts yet. Start by exploring topics."}
          actionLabel={filterStatus !== 'all' ? "Clear Filters" : "Browse Topics"}
          actionHref={filterStatus !== 'all' ? undefined : "/topics"}
          onAction={filterStatus !== 'all' ? () => { setFilterStatus('all'); setFilterPillar('all'); } : undefined}
        />
      )}
    </div>
  );
}
