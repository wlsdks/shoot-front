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

/**
 * 특정 채팅방 내 모든 메시지를 읽음 처리하는 API 호출
 * @param roomId 채팅방 ID
 * @param userId 사용자 ID
 * @returns
 */
export const markAllMessagesAsRead = (roomId: string, userId: string): Promise<AxiosResponse<any>> => {
    return api.post(`/chatrooms/${roomId}/readAll`, null, { params: { userId } });
};