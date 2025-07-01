import { useQuery } from '@tanstack/react-query';
import { searchFriends } from '../../api/friends';
import { convertToFriend } from '../utils/friendConverter';
import { API_CONFIG } from '../../../../shared/api/config';

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
        staleTime: API_CONFIG.QUERY_STALE_TIME.SHORT, // 검색은 더 자주 갱신
    });
}; 