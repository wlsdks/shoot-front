import api from "./api";
import { AxiosResponse } from "axios";
import axios from "axios";

/**
 * 채팅방 목록 조회 API
 */
export const getChatRooms = (
    userId: string
): Promise<AxiosResponse<any>> => {
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
export const markAllMessagesAsRead = (roomId: string, userId: string) => {
    const token = localStorage.getItem("accessToken");
    console.log("markAllMessagesAsRead 호출:", { roomId, userId, token });
    return axios.post(
        `http://localhost:8100/api/v1/messages/mark-read?roomId=${roomId}&userId=${userId}`,
        null,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    ).catch((error) => {
        console.error("markAllMessagesAsRead 실패:", error.response || error);
        throw error; // 에러를 상위로 전달
    });
};

/**
 * 1:1 채팅방 생성 API
 * @param userId 사용자 ID
 * @param friendId 친구 ID
 * @returns 생성된 채팅방 정보
 */
export const createDirectChat = (
    userId: string,
    friendId: string
): Promise<AxiosResponse<any>> => {
    return api.post(`/chatrooms/create/direct`, null, { params: { userId, friendId } });
};