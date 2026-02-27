/**
 * React Query hooks for Drafts
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { draftsApi } from '@/lib/api-client';
import { toast } from 'sonner';

export function useDrafts(
  params?: { status?: string; pillarId?: string; topicId?: string; sort?: string; page?: number; limit?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['drafts', params],
    queryFn: () => draftsApi.list(params),
    enabled: options?.enabled ?? true,
  });
}

export function useDraft(id: string) {
  return useQuery({
    queryKey: ['draft', id],
    queryFn: () => draftsApi.get(id),
    enabled: !!id,
  });
}

export function useUpdateDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => draftsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      queryClient.invalidateQueries({ queryKey: ['draft', variables.id] });
      toast.success('Draft updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update draft');
    },
  });
}

export function useDeleteDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: draftsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      toast.success('Draft deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete draft');
    },
  });
}

export function useApproveDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: draftsApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      toast.success('Draft approved!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve draft');
    },
  });
}

export function useScheduleDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduledFor }: { id: string; scheduledFor: string }) =>
      draftsApi.schedule(id, { scheduledFor }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      toast.success('Draft scheduled successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to schedule draft');
    },
  });
}
