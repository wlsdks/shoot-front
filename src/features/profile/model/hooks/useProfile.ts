import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserStatus } from '../../api/profile';

export const useProfile = (userId: number) => {
    const queryClient = useQueryClient();

    // 사용자 상태 업데이트
    const updateStatus = useMutation({
        mutationFn: (status: string) => updateUserStatus(userId, status),
        onSuccess: () => {
            // 사용자 정보 새로고침
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        },
    });

    return {
        updateStatus: updateStatus.mutate,
        isUpdating: updateStatus.isPending,
        updateError: updateStatus.error,
    };
}; 