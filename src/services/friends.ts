import api from "./api";
import { ApiResponse } from '../services/api';
import { extractData } from '../utils/apiUtils';

// 친구 인터페이스 정의
interface Friend {
    id: number; // string -> number로 변경
    username: string;
}

// 친구 목록 가져오기
export const getFriends = async (userId: number): Promise<Friend[]> => { // userId 타입 변경
    const response = await api.get<ApiResponse<Friend[]>>(`/friends?userId=${userId}`);
    return extractData(response);
}

// 받은 친구 요청 목록 조회
export const getIncomingRequests = async (userId: number): Promise<Friend[]> => { // userId 타입 변경
    const response = await api.get<ApiResponse<Friend[]>>(`/friends/incoming`, { params: { userId } });
    return extractData(response);
};

// 보낸 친구 요청 목록 조회
export const getOutgoingRequests = async (userId: number): Promise<Friend[]> => { // userId 타입 변경
    const response = await api.get<ApiResponse<Friend[]>>(`/friends/outgoing`, { params: { userId } });
    return extractData(response);
};

// 친구 요청 보내기 (targetUserId 기반)
export const sendFriendRequest = async (userId: number, targetUserId: number) => { // userId, targetUserId 타입 변경
    const response = await api.post<ApiResponse<any>>(`/friends/request`, null, { params: { userId, targetUserId } });
    return extractData(response);
};

// 친구 요청 수락
export const acceptFriendRequest = async (userId: number, requesterId: number) => { // userId, requesterId 타입 변경
    const response = await api.post<ApiResponse<any>>(`/friends/accept`, null, {
        params: { userId, requesterId }
    });
    return extractData(response);
};

// 친구 요청 거절
export const rejectFriendRequest = async (userId: number, requesterId: number) => { // userId, requesterId 타입 변경
    const response = await api.post<ApiResponse<any>>(`/friends/reject`, null, {
        params: { userId, requesterId }
    });
    return extractData(response);
};

// 친구 검색 API 함수
export const searchFriends = async (userId: number, query: string) => { // userId 타입 변경
    const response = await api.get<ApiResponse<Friend[]>>(`/friends/search`, { params: { userId, query } });
    return response; // 전체 응답 반환
};

// BFS 기반 친구 추천 API 호출 (skip 파라미터 추가)
export const getRecommendations = async (
    userId: number, // userId 타입 변경
    limit: number = 10,
    maxDepth: number = 2,
    skip: number = 0
): Promise<Friend[]> => {
    const response = await api.get<ApiResponse<Friend[]>>(`/friends/recommend/bfs`, { params: { userId, limit, maxDepth, skip } });
    return extractData(response);
};