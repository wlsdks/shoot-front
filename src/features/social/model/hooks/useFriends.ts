import { useQuery } from '@tanstack/react-query';
import { getFriends } from '../../api/friends';
import { Friend } from '../../types/friend';

// API 응답을 Friend 타입으로 변환하는 함수
const convertToFriend = (response: any): Friend => ({
    id: response.id,
    username: response.username,
    nickname: response.nickname,
    status: response.status || "온라인",
    profileImageUrl: response.profileImageUrl || null,
    backgroundImageUrl: response.backgroundImageUrl || null,
    bio: response.bio || null,
    userCode: response.userCode || "",
    lastSeenAt: response.lastSeenAt || null
});

export const useFriends = (userId: number) => {
    const { data, isLoading, error } = useQuery<Friend[]>({
        queryKey: ['friends', userId],
        queryFn: async () => {
            const friendsData = await getFriends(userId);
            return friendsData.map(convertToFriend);
        },
        enabled: !!userId,
    });

    return {
        data,
        isLoading,
        error,
    };
}; 