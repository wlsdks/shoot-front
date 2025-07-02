import { useQuery } from '@tanstack/react-query';
import { searchFriends } from '../../../../shared/api/friends';
import { convertToFriend } from '../utils/friendConverter';

// 친구 검색 훅
export const useFriendSearch = (userId: number | undefined, query: string) => {
    return useQuery({
        queryKey: ['friend-search', userId, query],
        queryFn: () => searchFriends(userId!, query),
        enabled: !!userId && !!query.trim(),
        select: (data) => data.map(convertToFriend)
    });
}; 