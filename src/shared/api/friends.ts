import { apiGet, apiPost } from '../lib/apiUtils';
import { FriendResponse } from '../../entities';

// 친구 목록 가져오기
export const getFriends = async (userId: number): Promise<FriendResponse[]> => {
    return apiGet<FriendResponse[]>('/friends', { userId });
}

// 받은 친구 요청 목록 조회
export const getIncomingRequests = async (userId: number): Promise<FriendResponse[]> => {
    return apiGet<FriendResponse[]>('/friends/incoming', { userId });
};

// 보낸 친구 요청 목록 조회
export const getOutgoingRequests = async (userId: number): Promise<FriendResponse[]> => {
    return apiGet<FriendResponse[]>('/friends/outgoing', { userId });
};

// 친구 요청 보내기 (targetUserId 기반)
export const sendFriendRequest = async (userId: number, targetUserId: number) => {
    return apiPost<any>('/friends/request', { userId, targetUserId });
};

// 친구 요청 수락
export const acceptFriendRequest = async (userId: number, requesterId: number) => {
    return apiPost<any>('/friends/accept', { userId, requesterId });
};

// 친구 요청 거절
export const rejectFriendRequest = async (userId: number, requesterId: number) => {
    return apiPost<any>('/friends/reject', { userId, requesterId });
};

// 친구 요청 취소
export const cancelFriendRequest = async (userId: number, targetUserId: number): Promise<void> => {
    return apiPost<void>('/friends/cancel', { userId, targetUserId });
}; 

// 친구 검색 API 함수
export const searchFriends = async (userId: number, query: string): Promise<FriendResponse[]> => {
    return apiGet<FriendResponse[]>('/friends/search', { userId, query });
};

// BFS 기반 친구 추천 API 호출 (skip 파라미터 추가)
export const getRecommendations = async (
    userId: number,
    limit: number = 10,
    maxDepth: number = 2,
    skip: number = 0
): Promise<FriendResponse[]> => {
    return apiGet<FriendResponse[]>('/friends/recommend/bfs', { userId, limit, maxDepth, skip });
};