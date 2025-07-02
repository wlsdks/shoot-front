import api from "./api";
import { ApiResponse } from './api';
import { extractData } from '../lib/apiUtils';
import { FriendResponse } from '../../entities';

// 친구 목록 가져오기
export const getFriends = async (userId: number): Promise<FriendResponse[]> => {
    const response = await api.get<ApiResponse<FriendResponse[]>>(`/friends?userId=${userId}`);
    return extractData(response);
}

// 받은 친구 요청 목록 조회
export const getIncomingRequests = async (userId: number): Promise<FriendResponse[]> => {
    const response = await api.get<ApiResponse<FriendResponse[]>>(`/friends/incoming`, { params: { userId } });
    return extractData(response);
};

// 보낸 친구 요청 목록 조회
export const getOutgoingRequests = async (userId: number): Promise<FriendResponse[]> => {
    const response = await api.get<ApiResponse<FriendResponse[]>>(`/friends/outgoing`, { params: { userId } });
    return extractData(response);
};

// 친구 요청 보내기 (targetUserId 기반)
export const sendFriendRequest = async (userId: number, targetUserId: number) => {
    const response = await api.post<ApiResponse<any>>(`/friends/request`, null, { params: { userId, targetUserId } });
    return extractData(response);
};

// 친구 요청 수락
export const acceptFriendRequest = async (userId: number, requesterId: number) => {
    const response = await api.post<ApiResponse<any>>(`/friends/accept`, null, {
        params: { userId, requesterId }
    });
    return extractData(response);
};

// 친구 요청 거절
export const rejectFriendRequest = async (userId: number, requesterId: number) => {
    const response = await api.post<ApiResponse<any>>(`/friends/reject`, null, {
        params: { userId, requesterId }
    });
    return extractData(response);
};

// 친구 검색 API 함수
export const searchFriends = async (userId: number, query: string): Promise<FriendResponse[]> => {
    const response = await api.get<ApiResponse<FriendResponse[]>>(`/friends/search`, { params: { userId, query } });
    return extractData(response);
};

// BFS 기반 친구 추천 API 호출 (skip 파라미터 추가)
export const getRecommendations = async (
    userId: number,
    limit: number = 10,
    maxDepth: number = 2,
    skip: number = 0
): Promise<FriendResponse[]> => {
    const response = await api.get<ApiResponse<FriendResponse[]>>(`/friends/recommend/bfs`, { params: { userId, limit, maxDepth, skip } });
    return extractData(response);
};

export const cancelFriendRequest = async (userId: number, targetUserId: number): Promise<void> => {
    const response = await api.post(`/friends/cancel`, null, {
        params: {
            userId,
            targetUserId
        }
    });
    return response.data;
}; 