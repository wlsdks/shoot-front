import { useQuery } from '@tanstack/react-query';
import { getFriends } from '../../api/friends';
import { Friend } from '../../types/friend';
import { convertToFriend } from '../utils/friendConverter';

// 친구 목록 조회 훅
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