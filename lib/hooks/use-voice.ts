/**
 * React Query hooks for Voice Training
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voiceApi } from '@/lib/api-client';
import { toast } from 'sonner';

export function useVoiceExamples(params?: { status?: string; pillarId?: string }) {
  return useQuery({
    queryKey: ['voice-examples', params],
    queryFn: () => voiceApi.getExamples(params),
  });
}

export function useAddVoiceExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voiceApi.addExample,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-examples'] });
      toast.success('Voice example added successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add voice example');
    },
  });
}

export function useDeleteVoiceExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voiceApi.deleteExample,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-examples'] });
      toast.success('Voice example deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete voice example');
    },
  });
}

export function useAnalyzeVoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voiceApi.analyzeVoice,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success(`Voice analyzed! Confidence: ${data.data.confidenceScore}%`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to analyze voice');
    },
  });
}
