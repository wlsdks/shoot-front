import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { updateUserStatus } from '../../api/profile';
import { setProfileImage, setBackgroundImage, getUserProfile } from '../../api/profile';
import { getCurrentUser } from '../../api/profile';
import { UserResponse } from '../../types/user';
import { Friend } from '../../../social/types/friend';

export const useProfile = (userId: number) => {
    const queryClient = useQueryClient();

    // 현재 사용자 정보 조회
    const { data: currentUser, isLoading: isLoadingUser } = useQuery<UserResponse>({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser
    });

    // 사용자 상태 업데이트
    const updateStatus = useMutation({
        mutationFn: (status: string) => updateUserStatus(userId, status),
        onSuccess: () => {
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
        currentUser,
        isLoadingUser,
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

// 친구 프로필 조회
export const useFriendProfile = (userId: number) => {
    const { data: friend, isLoading, error } = useQuery<Friend>({
        queryKey: ['friendProfile', userId],
        queryFn: () => getUserProfile(userId),
        enabled: !!userId,
    });

    return {
        friend,
        isLoading,
        error,
    };
}; 