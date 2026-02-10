/**
 * React Query hooks for Content Discovery
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { discoveryApi } from '@/lib/api-client';
import toast from 'react-hot-toast';

export function useDiscoverTopics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: discoveryApi.discover,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success(`Discovered ${data.data.topics.length} trending topics!`);
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
