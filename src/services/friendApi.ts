import api from "./api";  // 예: axios.create({ baseURL: 'http://localhost:8100/api/v1' }) 등
import { AxiosResponse } from "axios";

export const getFriends = (userId: string): Promise<AxiosResponse<string[]>> => {
    return api.get(`/friends?userId=${userId}`);
};

// 받은 친구 요청 목록 조회
export const getIncomingRequests = (userId: string): Promise<AxiosResponse<string[]>> => {
    return api.get(`/friends/incoming`, { params: { userId } });
};

// 보낸 친구 요청 목록 조회
export const getOutgoingRequests = (userId: string): Promise<AxiosResponse<string[]>> => {
    return api.get(`/friends/outgoing`, { params: { userId } });
};

// 친구 요청 보내기 (targetUserId 기반)
export const sendFriendRequest = (userId: string, targetUserId: string): Promise<AxiosResponse<any>> => {
    return api.post(`/friends/request`, null, { params: { userId, targetUserId } });
};

// 친구 추천: 추천 결과는 예제에서는 string[] – 예를 들어 추천 대상의 사용자 id 목록이라고 가정
export const getRecommendations = (userId: string, limit: number = 3): Promise<AxiosResponse<any>> => {
    return api.get(`/friends/recommend`, { params: { userId, limit } });
};

export const acceptFriendRequest = (userId: string, requesterId: string): Promise<AxiosResponse<any>> => {
    return api.post(`/friends/accept`, null, {
        params: { userId, requesterId }
    });
};

export const rejectFriendRequest = (userId: string, requesterId: string): Promise<AxiosResponse<any>> => {
    return api.post(`/friends/reject`, null, {
        params: { userId, requesterId }
    });
};

// 1:1 채팅방 생성 (없으면 새로, 있으면 재활용)
export const createDirectChat = (userId: string, friendId: string): Promise<AxiosResponse<any>> => {
    return api.post(`/chatrooms/create/direct`, null, {
        params: { userId, friendId }
    });
};

// 친구 검색 API 함수
export const searchFriends = (userId: string, query: string): Promise<AxiosResponse<any>> => {
    return api.get(`/friends/search`, {
        params: { userId, query }
    });
};