import { searchFriends } from '../../../../shared/api/friends';
import { convertToFriend } from '../utils/friendConverter';
import { useUserDataQuery } from '../../../../shared/lib/hooks/useQueryFactory';
import { FriendResponse } from '../../../../entities';

// 친구 검색 훅
export const useFriendSearch = (userId: number | undefined, query: string) => {
    return useUserDataQuery<FriendResponse[]>(
        ['friend-search', query],
        () => searchFriends(userId!, query),
        userId,
        {
            enabled: !!userId && !!query.trim(),
            select: (data: FriendResponse[]) => data.map(convertToFriend) as any
        }
    );
}; 