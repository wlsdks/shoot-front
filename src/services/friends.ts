import api from "./api";  // 예: axios.create({ baseURL: 'http://localhost:8100/api/v1' }) 등
import { AxiosResponse } from "axios";

// 친구 인터페이스 정의
interface Friend {
    id: string;
    username: string;
}

// 친구 목록 가져오기
export const getFriends = (userId: string): Promise<AxiosResponse<Friend[]>> => {
    return api.get(`/friends?userId=${userId}`);
}

// 받은 친구 요청 목록 조회
export const getIncomingRequests = (userId: string): Promise<AxiosResponse<Friend[]>> => {
    return api.get(`/friends/incoming`, { params: { userId } });
};

// 보낸 친구 요청 목록 조회
export const getOutgoingRequests = (userId: string): Promise<AxiosResponse<Friend[]>> => {
    return api.get(`/friends/outgoing`, { params: { userId } });
};

// 친구 요청 보내기 (targetUserId 기반)
export const sendFriendRequest = (userId: string, targetUserId: string): Promise<AxiosResponse<any>> => {
    return api.post(`/friends/request`, null, { params: { userId, targetUserId } });
};

// 친구 요청 수락
export const acceptFriendRequest = (userId: string, requesterId: string): Promise<AxiosResponse<any>> => {
    return api.post(`/friends/accept`, null, {
        params: { userId, requesterId }
    });
};

// 친구 요청 거절
export const rejectFriendRequest = (userId: string, requesterId: string): Promise<AxiosResponse<any>> => {
    return api.post(`/friends/reject`, null, {
        params: { userId, requesterId }
    });
};

// 친구 검색 API 함수
export const searchFriends = (userId: string, query: string): Promise<AxiosResponse<Friend[]>> => {
    return api.get(`/friends/search`, { params: { userId, query } });
};

// BFS 기반 친구 추천 API 호출 (skip 파라미터 추가)
export const getRecommendations = (
    userId: string,
    limit: number = 10,       // 한 번에 가져올 추천 친구 수
    maxDepth: number = 2,
    skip: number = 0          // 이미 가져온 추천 수 (페이지네이션)
): Promise<AxiosResponse<Friend[]>> => {
    return api.get(`/friends/recommend/bfs`, { params: { userId, limit, maxDepth, skip } });
};