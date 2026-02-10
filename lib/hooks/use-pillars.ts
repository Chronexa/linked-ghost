/**
 * React Query hooks for Content Pillars
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pillarsApi } from '@/lib/api-client';
import toast from 'react-hot-toast';

export function usePillars(params?: { status?: string; sort?: string }) {
  return useQuery({
    queryKey: ['pillars', params],
    queryFn: () => pillarsApi.list(params),
  });
}

export function usePillar(id: string) {
  return useQuery({
    queryKey: ['pillar', id],
    queryFn: () => pillarsApi.get(id),
    enabled: !!id,
  });
}

export function useCreatePillar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pillarsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pillars'] });
      toast.success('Pillar created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create pillar');
    },
  });
}

export function useUpdatePillar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => pillarsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pillars'] });
      queryClient.invalidateQueries({ queryKey: ['pillar', variables.id] });
      toast.success('Pillar updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update pillar');
    },
  });
}

export function useDeletePillar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pillarsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pillars'] });
      toast.success('Pillar deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete pillar');
    },
  });
}
