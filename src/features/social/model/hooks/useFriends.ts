import { useQuery } from '@tanstack/react-query';
import { getFriends } from '../../../../shared/api/friends';
import { convertToFriend } from '../utils/friendConverter';
import { DEFAULT_QUERY_OPTIONS } from '../../../../shared/lib/hooks/useQueryFactory';
import { QUERY_KEYS } from '../../../../shared/lib/api/queryKeys';
import { FriendResponse } from '../../../../entities';

// 친구 목록 조회 훅
export const useFriends = (userId: number) => {
    return useQuery({
        queryKey: QUERY_KEYS.FRIENDS.list(userId),
        queryFn: () => getFriends(userId),
        enabled: !!userId,
        select: (data: FriendResponse[]) => data.map(convertToFriend) as any,
        ...DEFAULT_QUERY_OPTIONS
    });
}; 