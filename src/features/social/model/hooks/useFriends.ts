import { useQuery } from '@tanstack/react-query';
import { getFriends } from '../../../../shared/api/friends';
import { convertToFriend } from '../utils/friendConverter';

// 친구 목록 조회 훅
export const useFriends = (userId: number) => {
    return useQuery({
        queryKey: ['friends', userId],
        queryFn: () => getFriends(userId),
        enabled: !!userId,
        select: (data) => data.map(convertToFriend)
    });
}; 