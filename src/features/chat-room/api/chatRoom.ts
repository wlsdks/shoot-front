import { apiGet, apiPost } from "../../../shared/lib/apiUtils";
import { ChatRoomResponse, DirectChatRoomResponse, FindDirectChatRoomParams } from '../types/chatRoom.types';

/**
 * 채팅방 목록 조회 API
 */
export const getChatRooms = async (userId: number) => {
    const data = await apiGet<any>('/chatrooms', { userId });
    return data;
};

/**
 * 채팅방 즐겨찾기(핀) 상태 업데이트 API
 */
export const updateChatRoomFavorite = async (
    roomId: number,
    userId: number,
    isFavorite: boolean
) => {
    return apiPost<ChatRoomResponse>('/chatrooms/favorite', {
        roomId,
        userId,
        isFavorite
    });
};

/**
 * 1:1 채팅방 생성 API
 * @param userId 사용자 ID
 * @param friendId 친구 ID
 * @returns 생성된 채팅방 정보
 */
export const createDirectChat = async (
    userId: number,
    friendId: number
) => {
    const data = await apiPost<DirectChatRoomResponse>('/chatrooms/create/direct', { 
        userId, 
        friendId 
    });
    return { data };
};

// 1:1 채팅방 찾기 API
export const findDirectChatRoom = async (
    { myId, otherUserId }: FindDirectChatRoomParams
): Promise<ChatRoomResponse> => {
    return apiGet<ChatRoomResponse>('/chatrooms/direct', { myId, otherUserId });
}; 