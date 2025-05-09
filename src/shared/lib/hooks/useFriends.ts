import { useQuery } from '@tanstack/react-query';
import { getFriends } from '../../api/friends';
import { Friend, FriendResponse } from '../../types/friend.types';

// API 응답을 Friend 타입으로 변환하는 함수
const convertToFriend = (response: FriendResponse): Friend => ({
    id: response.id,
    name: response.username,
    username: response.username,
    nickname: response.nickname,
    status: "온라인", // TODO: 실제 상태 정보로 대체
    profileImageUrl: response.profileImageUrl
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