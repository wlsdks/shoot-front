import api from "./api";
import axios from "axios";
import { ApiResponse } from '../services/api';
import { extractData } from '../utils/apiUtils';

/**
 * 채팅방 목록 조회 API
 */
export const getChatRooms = async (userId: number) => { // userId 타입 변경
    const response = await api.get<ApiResponse<any>>(`/chatrooms`, { params: { userId } });
    return {
        data: extractData(response)
    };
};

/**
 * 채팅방 즐겨찾기(핀) 상태 업데이트 API
 */
export const updateChatRoomFavorite = async (
    roomId: number,
    userId: number,
    isFavorite: boolean
) => {
    const response = await api.post<ApiResponse<any>>(`/chatrooms/favorite`, null, {
        params: {
            roomId,
            userId,
            isFavorite
        }
    });
    return extractData(response);
};

/**
 * 특정 채팅방 내 모든 메시지를 읽음 처리하는 API
 * @param roomId 채팅방 ID
 * @param userId 사용자 ID
 * @returns
 */
export const markAllMessagesAsRead = async (roomId: number, userId: number, requestId?: string) => { // roomId, userId 타입 변경
    const token = localStorage.getItem("accessToken");
    
    // requestId 매개변수 추가 (세션 대신 단일 요청 식별자 사용)
    const requestIdParam = requestId ? `&requestId=${requestId}` : '';
    
    const response = await axios.post<ApiResponse<any>>(
        `http://localhost:8100/api/v1/messages/mark-read?roomId=${roomId}&userId=${userId}${requestIdParam}`,
        null,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    
    return response.data;
};

/**
 * 1:1 채팅방 생성 API
 * @param userId 사용자 ID
 * @param friendId 친구 ID
 * @returns 생성된 채팅방 정보
 */
export const createDirectChat = async (
    userId: number, // userId 타입 변경
    friendId: number // friendId 타입 변경
) => {
    const response = await api.post<ApiResponse<any>>(`/chatrooms/create/direct`, null, { params: { userId, friendId } });
    return {
        data: extractData(response)
    };
};