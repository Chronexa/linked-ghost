/**
 * React Query hooks for Topics
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { topicsApi, rawTopicsApi } from '@/lib/api-client';
import { toast } from 'sonner';

export function useRawTopics(params?: { source?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['raw-topics', params],
    queryFn: () => rawTopicsApi.list(params),
  });
}

export function useRawTopic(id: string | null) {
  return useQuery({
    queryKey: ['raw-topic', id],
    queryFn: () => rawTopicsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateRawTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rawTopicsApi.create,
    onMutate: async (newTopic) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['raw-topics'] });

      // Snapshot previous value for rollback
      const previousTopics = queryClient.getQueryData(['raw-topics']);

      // Optimistically update cache
      queryClient.setQueryData(['raw-topics'], (old: any) => {
        if (!old?.data?.data) return old;

        const optimisticTopic = {
          ...newTopic,
          id: 'temp-' + Date.now(),
          userId: 'current-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          ...old,
          data: {
            ...old.data,
            data: [optimisticTopic, ...(old.data.data || [])],
          },
        };
      });

      return { previousTopics };
    },
    onError: (error: Error, newTopic, context) => {
      // Rollback on error
      if (context?.previousTopics) {
        queryClient.setQueryData(['raw-topics'], context.previousTopics);
      }
      toast.error(error.message || 'Failed to create topic');
    },
    onSettled: () => {
      // Always refetch after success or error
      queryClient.invalidateQueries({ queryKey: ['raw-topics'] });
    },
  });
}


export function useDeleteRawTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rawTopicsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raw-topics'] });
      queryClient.invalidateQueries({ queryKey: ['raw-topic'] });
      toast.success('Topic removed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete topic');
    },
  });
}

export function useTopics(params?: { status?: string; pillarId?: string; minScore?: number; sort?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['topics', params],
    queryFn: () => topicsApi.list(params),
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: ['topic', id],
    queryFn: () => topicsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: topicsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Topic created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create topic');
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => topicsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['topic', variables.id] });
      toast.success('Topic updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update topic');
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: topicsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Topic deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete topic');
    },
  });
}

export function useGenerateDrafts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: topicsApi.generate,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success(`Generated ${data.data?.drafts?.length || 2} draft variants!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate drafts');
    },
  });
}

export function useClassifyTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: topicsApi.classify,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['raw-topics'] });
      toast.success('Topic classified successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to classify topic');
    },
  });
}

export function useClassifyBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { topics: Array<{ rawTopicId?: string; content: string; sourceUrl?: string }>; autoApprove?: boolean }) =>
      topicsApi.classifyBatch(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['raw-topics'] });
      toast.success(`${variables.topics.length} topics classified!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to classify topics');
    },
  });
}
