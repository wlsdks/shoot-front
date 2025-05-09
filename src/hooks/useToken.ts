import { useMutation } from '@tanstack/react-query';
import { refreshTokenApi } from '../services/auth';

export const useToken = () => {
    const refreshToken = useMutation({
        mutationFn: (refreshToken: string) => refreshTokenApi(refreshToken),
    });

    return {
        refreshToken: refreshToken.mutate,
        isRefreshing: refreshToken.isPending,
        refreshError: refreshToken.error,
    };
}; 