/**
 * React Query hooks for Content Discovery
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { discoveryApi } from '@/lib/api-client';
import { toast } from 'sonner';

export function useDiscoverTopics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discoveryApi.discover,
    onSuccess: (data: any) => {
      const count = data.data?.topics?.length ?? 0;
      toast.success(`Found ${count} ideas! Select the ones you want to save.`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to discover topics');
    },
  });
}

export function useResearchTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discoveryApi.research,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Topic research completed!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to research topic');
    },
  });
}
