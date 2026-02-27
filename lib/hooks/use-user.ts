/**
 * React Query hooks for User & Profile
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api-client';
import { toast } from 'sonner';

export function useUser() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: userApi.getProfile,
    retry: 1,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: userApi.getSubscription,
  });
}
