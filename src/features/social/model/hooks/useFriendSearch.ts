import { useQuery } from '@tanstack/react-query';
import { searchFriends } from '../../../../shared/api/friends';
import { convertToFriend } from '../utils/friendConverter';
import { DEFAULT_QUERY_OPTIONS } from '../../../../shared/lib/hooks/useQueryFactory';
import { QUERY_KEYS } from '../../../../shared/lib/api/queryKeys';
import { FriendResponse } from '../../../../entities';

// 친구 검색 훅
export const useFriendSearch = (userId: number | undefined, query: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.FRIENDS.search(query),
        queryFn: () => searchFriends(userId!, query),
        enabled: !!userId && !!query.trim(),
        select: (data: FriendResponse[]) => data.map(convertToFriend) as any,
        ...DEFAULT_QUERY_OPTIONS
    });
}; 