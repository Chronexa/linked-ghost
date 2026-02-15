'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { discoveryApi } from '@/lib/api-client';
import toast from 'react-hot-toast';

export function useTriggerResearch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: discoveryApi.triggerBackgroundResearch,
        onSuccess: () => {
            // Invalidate queries to refresh dashboard stats if needed
            // Though research is async, so stats won't update immediately.
            // We might want to just show a toast.
            toast.success('Research started! It may take a minute to find new topics.');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to start research');
        },
    });
}
