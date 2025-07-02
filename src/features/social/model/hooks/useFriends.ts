import { getFriends } from '../../../../shared/api/friends';
import { convertToFriend } from '../utils/friendConverter';
import { useUserDataQuery } from '../../../../shared/lib/hooks/useQueryFactory';
import { FriendResponse } from '../../../../entities';

// 친구 목록 조회 훅
export const useFriends = (userId: number) => {
    return useUserDataQuery<FriendResponse[]>(
        ['friends'],
        () => getFriends(userId),
        userId,
        {
            select: (data: FriendResponse[]) => data.map(convertToFriend) as any
        }
    );
}; 