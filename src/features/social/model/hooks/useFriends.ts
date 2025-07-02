import { getFriends } from '../../api/friends';
import { Friend } from '../../../../entities';
import { convertToFriend } from '../utils/friendConverter';
import { useUserDataQuery } from '../../../../shared/lib/hooks/useQueryFactory';

// 친구 목록 조회 훅
export const useFriends = (userId: number) => {
    const { data, isLoading, error } = useUserDataQuery<Friend[]>(
        ['friends'],
        async () => {
            const friendsData = await getFriends(userId);
            return friendsData.map(convertToFriend);
        },
        userId
    );

    return {
        data,
        isLoading,
        error,
    };
}; 