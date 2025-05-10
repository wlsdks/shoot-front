import { useQuery } from '@tanstack/react-query';
import { searchFriends } from '../../api/friends';
import { convertToFriend } from '../utils/friendConverter';

// 친구 검색 훅
export const useFriendSearch = (userId: number | undefined, query: string) => {
    return useQuery({
        queryKey: ['friends', 'search', query],
        queryFn: async () => {
            if (!userId || !query.trim()) return [];
            const response = await searchFriends(userId, query);
            return response.map(convertToFriend);
        },
        enabled: !!userId && query.trim() !== "",
        staleTime: 1000 * 60, // 1분 동안 캐시 유지
    });
}; 