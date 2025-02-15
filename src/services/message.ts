import api from "./api";  // 예: axios.create({ baseURL: 'http://localhost:8100/api/v1' }) 등
import { AxiosResponse } from "axios";

// 채팅 메시지 조회 API 호출
export const getChatMessages = (roomId: string, before?: string, limit: number = 20) => {
    return api.get(`/messages/get`, { params: { roomId, before, limit } });
};

// 메시지 수정하기
export const editMessage = (messageId: string, newText: string): Promise<AxiosResponse<any>> => {
    return api.put(`/messages/edit`, null, { params: { messageId, newText } });
};

// 메시지 삭제하기
export const deleteMessage = (messageId: string): Promise<AxiosResponse<any>> => {
    return api.delete(`/messages/delete`, { params: { messageId } });
};

/**
 * 메시지 전달(Forward) API 호출
 * @param originalMessageId 전달할 원본 메시지 ID
 * @param targetRoomId 전달할 대상 채팅방 ID
 * @param forwardingUserId 전달 요청한 사용자 ID
 * @returns 전달된 메시지 정보를 담은 응답 (예: 메시지 내용, 상태 등)
 */
export const forwardMessage = (
    originalMessageId: string,
    targetRoomId: string,
    forwardingUserId: string
): Promise<AxiosResponse<any>> => {
    return api.post(`/messages/forward`, null, {
        params: { originalMessageId, targetRoomId, forwardingUserId }
    });
};
