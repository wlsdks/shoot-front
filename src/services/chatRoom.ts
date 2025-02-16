import api from "./api";
import { AxiosResponse } from "axios";

/**
 * 채팅방 목록 조회 API
 */
export const getChatRooms = (userId: string): Promise<AxiosResponse<any>> => {
    return api.get(`/chatrooms`, { params: { userId } });
};

/**
 * 채팅방 즐겨찾기(핀) 상태 업데이트 API
 */
export const updateChatRoomFavorite = (
    roomId: string,
    userId: string,
    isFavorite: boolean
): Promise<AxiosResponse<any>> => {
    return api.post(`/chatrooms/favorite`, null, { params: { roomId, userId, isFavorite } });
};