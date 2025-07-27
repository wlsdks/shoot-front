import { apiGet, apiPost, apiPut, apiDelete } from "../../../shared/lib/apiUtils";

// 채팅 메시지 조회 API 호출 (lastId 기준)
export const getChatMessages = async (
    roomId: number,
    lastId?: string,
    limit: number = 20
) => {
    const data = await apiGet<any>('/messages/get', { roomId, lastId, limit });
    return { data };
};

// 메시지 수정하기
export const editMessage = async (messageId: string, newText: string) => {
    return apiPut<any>('/messages/edit', null, { messageId, newText });
};

// 메시지 삭제하기
export const deleteMessage = async (messageId: string) => {
    return apiDelete<any>('/messages/delete', { messageId });
};

// 메시지 고정하기
export const pinMessage = async (messageId: string) => {
    return apiPost<any>(`/messages/${messageId}/pin`);
};

// 메시지 고정 해제하기
export const unpinMessage = async (messageId: string) => {
    return apiDelete<any>(`/messages/${messageId}/pin`);
};

// 채팅방의 고정된 메시지 목록 가져오기
export const getPinnedMessages = async (roomId: number) => {
    const data = await apiGet<any>('/messages/pins', { roomId });
    return { data }; // 일관성을 위해 { data } 형태로 반환
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
    targetRoomId: number,
    forwardingUserId: number
) => {
    return apiPost<any>('/messages/forward', { 
        originalMessageId, 
        targetRoomId, 
        forwardingUserId 
    });
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
    return apiPost<any>('/messages/forward/user', { 
        originalMessageId, 
        targetUserId, 
        forwardingUserId 
    });
};