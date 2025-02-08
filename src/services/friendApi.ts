import api from "./api";  // 예: axios.create({ baseURL: 'http://localhost:8100/api/v1' }) 등
import { AxiosResponse } from "axios";

export const getFriends = (userId: string): Promise<AxiosResponse<string[]>> => {
    return api.get(`/friends?userId=${userId}`);
};

export const getIncomingRequests = (userId: string): Promise<AxiosResponse<string[]>> => {
    return api.get(`/friends/incoming?userId=${userId}`);
};

export const getOutgoingRequests = (userId: string): Promise<AxiosResponse<string[]>> => {
    return api.get(`/friends/outgoing?userId=${userId}`);
};

export const sendFriendRequest = (userId: string, targetUserId: string): Promise<AxiosResponse<any>> => {
    // POST /friends/request?userId=xxx&targetUserId=yyy
    return api.post(`/friends/request`, null, {
        params: { userId, targetUserId }
    });
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

export const getRecommendations = (userId: string, limit: number = 3): Promise<AxiosResponse<string[]>> => {
    return api.get(`/friends/recommend`, {
        params: { userId, limit }
    });
};

// 1:1 채팅방 생성(없으면 새로, 있으면 재활용)
export const createDirectChat = (userId: string, friendId: string): Promise<AxiosResponse<any>> => {
  // POST /chatrooms/create/direct?userId=xxx&friendId=yyy
    return api.post(`/chatrooms/create/direct`, null, {
        params: { userId, friendId }
    });
};