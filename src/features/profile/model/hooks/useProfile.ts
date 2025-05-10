import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserStatus } from '../../api/profile';
import { setProfileImage, setBackgroundImage } from '../../api/profile';

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

    // 프로필 이미지 설정
    const updateProfileImage = useMutation({
        mutationFn: setProfileImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        },
    });

    // 배경 이미지 설정
    const updateBackgroundImage = useMutation({
        mutationFn: setBackgroundImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        },
    });

    return {
        updateStatus: updateStatus.mutate,
        isUpdating: updateStatus.isPending,
        updateError: updateStatus.error,
        updateProfileImage: updateProfileImage.mutate,
        isUpdatingProfileImage: updateProfileImage.isPending,
        updateProfileImageError: updateProfileImage.error,
        updateBackgroundImage: updateBackgroundImage.mutate,
        isUpdatingBackgroundImage: updateBackgroundImage.isPending,
        updateBackgroundImageError: updateBackgroundImage.error,
    };
}; 