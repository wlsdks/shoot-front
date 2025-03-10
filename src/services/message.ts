import api from "./api";
import { ApiResponse } from '../services/api';
import { extractData } from '../utils/apiUtils';

// 채팅 메시지 조회 API 호출 (lastId 기준)
export const getChatMessages = async (
    roomId: string,
    lastId?: string,
    limit: number = 20
) => {
    const response = await api.get<ApiResponse<any>>(`/messages/get`, { params: { roomId, lastId, limit } });
    return {
        data: extractData(response)
    };
};

// 메시지 수정하기
export const editMessage = async (messageId: string, newText: string) => {
    const response = await api.put<ApiResponse<any>>(`/messages/edit`, null, { params: { messageId, newText } });
    return extractData(response);
};

// 메시지 삭제하기
export const deleteMessage = async (messageId: string) => {
    const response = await api.delete<ApiResponse<any>>(`/messages/delete`, { params: { messageId } });
    return extractData(response);
};

/**
 * 메시지 전달(Forward) API 호출
 * @param originalMessageId 전달할 원본 메시지 ID
 * @param targetRoomId 전달할 대상 채팅방 ID
 * @param forwardingUserId 전달 요청한 사용자 ID
 * @returns 전달된 메시지 정보를 담은 응답 (예: 메시지 내용, 상태 등)
 */
export const forwardMessage = async (
    originalMessageId: string,
    targetRoomId: string,
    forwardingUserId: string
) => {
    const response = await api.post<ApiResponse<any>>(`/messages/forward`, null, {
        params: { originalMessageId, targetRoomId, forwardingUserId }
    });
    return extractData(response);
};