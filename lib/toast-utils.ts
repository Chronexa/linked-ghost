import toast from 'react-hot-toast';

export function showSuccess(message: string) {
    toast.success(message, {
        style: {
            background: '#1A1A1D',
            color: '#FFFFFF',
            border: '1px solid #27272A',
        },
        iconTheme: {
            primary: '#52B788',
            secondary: '#1A1A1D',
        },
    });
}

export function showError(message: string) {
    toast.error(message, {
        style: {
            background: '#FFF0F0',
            color: '#DC2626',
            border: '1px solid #FECACA',
        },
        iconTheme: {
            primary: '#DC2626',
            secondary: '#FFFFFF',
        },
    });
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
