/**
 * React Query hook for User Stats
 */

'use client';

import { useQuery } from '@tanstack/react-query';

export interface StatsResponse {
    pendingTopics: number;
    classifiedTopics: number;
    generatedPosts: number;
    approvalRate: number; // 0-100
    postsThisMonth: number;
}

export function useStats() {
    return useQuery({
        queryKey: ['user', 'stats'],
        queryFn: async () => {
            const res = await fetch('/api/user/stats');
            if (!res.ok) {
                throw new Error('Failed to fetch stats');
            }
            const json = await res.json();
            return json.data as StatsResponse;
        },
        staleTime: 30_000, // 30 seconds - stats don't need to be real-time
        refetchOnWindowFocus: true, // Refresh when user returns to tab
    });
}
