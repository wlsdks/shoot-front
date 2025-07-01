import { useMutation } from '@tanstack/react-query';
import { FindDirectChatRoomParams, ChatRoomResponse } from '../../types/chatRoom.types';
import { getChatRooms, updateChatRoomFavorite, findDirectChatRoom } from '../../api/chatRoom';
import { useUserDataQuery, useMutationWithSingleInvalidation } from '../../../../shared/lib/hooks/useQueryFactory';

export const useChatRooms = (userId: number) => {
    // 채팅방 목록 조회
    const { data: chatRooms, isLoading, error } = useUserDataQuery(
        ['chatRooms'],
        () => getChatRooms(userId),
        userId
    );

    // 채팅방 즐겨찾기 상태 업데이트
    const updateFavorite = useMutationWithSingleInvalidation(
        ({ roomId, isFavorite }: { roomId: number; isFavorite: boolean }) =>
            updateChatRoomFavorite(roomId, userId, isFavorite),
        ['chatRooms', userId]
    );

    // 1:1 채팅방 찾기
    const findDirectChatRoomMutation = useMutation<ChatRoomResponse, Error, FindDirectChatRoomParams>({
        mutationFn: findDirectChatRoom,
    });

    return {
        chatRooms,
        isLoading,
        error,
        updateFavorite,
        findDirectChatRoom: findDirectChatRoomMutation,
    };
}; 