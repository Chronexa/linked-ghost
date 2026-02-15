import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api-client';
import toast from 'react-hot-toast';

export function useProfile() {
    return useQuery({
        queryKey: ['user-profile'],
        queryFn: () => userApi.getProfile(),
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            toast.success('Profile updated successfully');
        },
        onError: (error: Error) => {
            toast.error('Failed to update profile');
        }
    });
}
