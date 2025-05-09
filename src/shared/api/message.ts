import api from "./api";
import { ApiResponse } from './api';
import { extractData } from '../lib/apiUtils';

// 채팅 메시지 조회 API 호출 (lastId 기준)
export const getChatMessages = async (
    roomId: number, // string -> number로 변경
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

// 메시지 고정하기
export const pinMessage = async (messageId: string) => {
    const response = await api.post<ApiResponse<any>>(`/messages/${messageId}/pin`);
    return extractData(response);
};

// 메시지 고정 해제하기
export const unpinMessage = async (messageId: string) => {
    const response = await api.delete<ApiResponse<any>>(`/messages/${messageId}/pin`);
    return extractData(response);
};

// 채팅방의 고정된 메시지 목록 가져오기
export const getPinnedMessages = async (roomId: number) => { // string -> number로 변경
    const response = await api.get<ApiResponse<any>>(`/messages/pins?roomId=${roomId}`);
    return response.data; // 전체 응답 데이터를 반환하여 컴포넌트에서 처리
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
    targetRoomId: number, // string -> number로 변경
    forwardingUserId: number // string -> number로 변경
) => {
    const response = await api.post<ApiResponse<any>>(`/messages/forward`, null, {
        params: { originalMessageId, targetRoomId, forwardingUserId }
    });
    return extractData(response);
};

/**
 * 사용자에게 직접 메시지 전달 API 호출
 * @param originalMessageId 전달할 원본 메시지 ID
 * @param targetUserId 전달할 대상 사용자 ID
 * @param forwardingUserId 전달 요청한 사용자 ID
 * @returns 전달된 메시지 정보를 담은 응답
 */
export const forwardMessageToUser = async (
    originalMessageId: string,
    targetUserId: number,
    forwardingUserId: number
) => {
    const response = await api.post<ApiResponse<any>>(`/messages/forward/user`, null, {
        params: { originalMessageId, targetUserId, forwardingUserId }
    });
    return extractData(response);
};