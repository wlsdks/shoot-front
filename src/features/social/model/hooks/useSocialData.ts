import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getFriends,
    getIncomingRequests,
    getOutgoingRequests,
    getRecommendations,
    sendFriendRequest,
    acceptFriendRequest,
    cancelFriendRequest,
} from '../../api/friends';
import { Friend, FriendResponse } from '../../../../entities';

// API 응답을 Friend 타입으로 변환하는 함수
const convertToFriend = (response: FriendResponse): Friend => ({
    id: response.id,
    username: response.username,
    nickname: response.nickname,
    status: "온라인", // TODO: 실제 상태 정보로 대체
    profileImageUrl: response.profileImageUrl,
    isFriend: true,
    isPending: false,
    isIncoming: false,
    isOutgoing: false
});

interface SocialData {
    friends: Friend[];
    incomingRequests: Friend[];
    outgoingRequests: Friend[];
    recommendedFriends: Friend[];
}

export const useSocialData = (userId: number) => {
    const queryClient = useQueryClient();
    const limit = 10;

    // 소셜 데이터 조회
    const { data, isLoading, error } = useQuery<SocialData>({
        queryKey: ['socialData', userId],
        queryFn: async () => {
            const [friendsData, incData, outData, recData] = await Promise.all([
                getFriends(userId),
                getIncomingRequests(userId),
                getOutgoingRequests(userId),
                getRecommendations(userId, limit, 2, 0),
            ]);

            return {
                friends: friendsData.map(convertToFriend),
                incomingRequests: incData.map(convertToFriend),
                outgoingRequests: outData.map(convertToFriend),
                recommendedFriends: recData.map(convertToFriend),
            };
        },
        enabled: !!userId,
    });

    // 친구 요청 보내기
    const sendFriendRequestMutation = useMutation({
        mutationFn: (targetUserId: number) => sendFriendRequest(userId, targetUserId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['socialData', userId] });
        },
    });

    // 친구 요청 수락
    const acceptRequestMutation = useMutation({
        mutationFn: (requesterId: number) => acceptFriendRequest(userId, requesterId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['socialData', userId] });
        },
    });

    // 친구 요청 취소
    const cancelRequestMutation = useMutation({
        mutationFn: (targetUserId: number) => cancelFriendRequest(userId, targetUserId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['socialData', userId] });
        },
    });

    // 추천 친구 더 불러오기
    const fetchMoreRecommended = async (skip: number) => {
        const newRecommended = await getRecommendations(userId, limit, 2, skip);
        queryClient.setQueryData<SocialData>(['socialData', userId], (old) => {
            if (!old) return old;
            return {
                ...old,
                recommendedFriends: [...old.recommendedFriends, ...newRecommended.map(convertToFriend)],
            };
        });
    };

    return {
        data,
        isLoading,
        error,
        sendFriendRequest: sendFriendRequestMutation,
        acceptRequest: acceptRequestMutation,
        cancelRequest: cancelRequestMutation,
        fetchMoreRecommended,
    };
}; 