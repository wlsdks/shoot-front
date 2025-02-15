import api from "./api";  // 예: axios.create({ baseURL: 'http://localhost:8100/api/v1' }) 등
import { AxiosResponse } from "axios";

// 채팅방 목록 API 호출
export const getChatRooms = (userId: string) => {
    return api.get(`/chatrooms?userId=${userId}`);
};

// 1:1 채팅방 생성 (없으면 새로, 있으면 재활용)
export const createDirectChat = (userId: string, friendId: string): Promise<AxiosResponse<any>> => {
    return api.post(`/chatrooms/create/direct`, null, {
        params: { userId, friendId }
    });
};