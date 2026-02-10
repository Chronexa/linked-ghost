/**
 * React Query hooks for Topics
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { topicsApi } from '@/lib/api-client';
import toast from 'react-hot-toast';

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
      toast.success(`Generated ${data.data.drafts.length} draft variants!`);
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
      toast.success('Topic classified successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to classify topic');
    },
  });
}
