import { useQuery } from '@tanstack/react-query';
import { updateUserStatus } from '../../api/profile';
import { setProfileImage, setBackgroundImage, getUserProfile } from '../../api/profile';
import { getCurrentUser } from '../../api/profile';
import { UserResponse, Friend } from '../../../../entities';
import { useMutationWithSingleInvalidation } from '../../../../shared/lib/hooks/useQueryFactory';

export const useProfile = (userId: number) => {
    // 현재 사용자 정보 조회
    const { data: currentUser, isLoading: isLoadingUser } = useQuery<UserResponse>({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser
    });

    // 사용자 상태 업데이트
    const updateStatus = useMutationWithSingleInvalidation({
        mutationFn: (status: string) => updateUserStatus(userId, status),
        invalidationTarget: ['currentUser'],
        successMessage: '상태가 업데이트되었습니다.',
    });

    // 프로필 이미지 설정
    const updateProfileImage = useMutationWithSingleInvalidation({
        mutationFn: setProfileImage,
        invalidationTarget: ['currentUser'],
        successMessage: '프로필 이미지가 업데이트되었습니다.',
    });

    // 배경 이미지 설정
    const updateBackgroundImage = useMutationWithSingleInvalidation({
        mutationFn: setBackgroundImage,
        invalidationTarget: ['currentUser'],
        successMessage: '배경 이미지가 업데이트되었습니다.',
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