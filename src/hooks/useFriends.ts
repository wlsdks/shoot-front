import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFriends, acceptFriendRequest } from '../services/friends';
import { FriendResponse } from '../types/friend.types';

export const useFriends = (userId: number) => {
    const queryClient = useQueryClient();

    // 친구 목록 조회
    const { data: friends, isLoading, error } = useQuery<FriendResponse[]>({
        queryKey: ['friends', userId],
        queryFn: () => getFriends(userId),
    });

    // 친구 요청 수락
    const acceptRequest = useMutation({
        mutationFn: ({ requesterId }: { requesterId: number }) => 
        acceptFriendRequest(userId, requesterId),
        onSuccess: () => {
        // 친구 목록 새로고침
        queryClient.invalidateQueries({ queryKey: ['friends', userId] });
        },
    });

    return {
        friends,
        isLoading,
        error,
        acceptRequest,
    };
}; 