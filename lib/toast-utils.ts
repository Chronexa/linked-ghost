import { toast } from 'sonner';

export function showSuccess(message: string) {
    toast.success(message);
}

export function showError(message: string) {
    toast.error(message);
}

export function showLoading(message: string) {
    return toast.loading(message, {
        style: {
            background: '#1A1A1D',
            color: '#FFFFFF',
            border: '1px solid #27272A',
        },
    });
}

export function dismissToast(toastId?: string) {
    toast.dismiss(toastId);
}
