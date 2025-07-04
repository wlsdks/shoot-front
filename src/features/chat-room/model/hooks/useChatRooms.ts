import { useMutation, useQuery } from '@tanstack/react-query';
import { FindDirectChatRoomParams, ChatRoomResponse } from '../../types/chatRoom.types';
import { getChatRooms, updateChatRoomFavorite, findDirectChatRoom } from '../../api/chatRoom';
import { useMutationWithSingleInvalidation, DEFAULT_QUERY_OPTIONS } from '../../../../shared/lib/hooks/useQueryFactory';
import { ChatRoom } from '../../../../entities';

export const useChatRooms = (userId: number) => {
    // 채팅방 목록 조회
    const { data: chatRooms, isLoading, error } = useQuery<ChatRoom[]>({
        queryKey: ['chatRooms', userId],
        queryFn: () => getChatRooms(userId),
        enabled: !!userId,
        ...DEFAULT_QUERY_OPTIONS
    });

    // 채팅방 즐겨찾기 상태 업데이트
    const updateFavorite = useMutationWithSingleInvalidation({
        mutationFn: ({ roomId, isFavorite }: { roomId: number; isFavorite: boolean }) =>
            updateChatRoomFavorite(roomId, userId, isFavorite),
        invalidationTarget: ['chatRooms', userId],
        successMessage: '즐겨찾기가 업데이트되었습니다.',
    });

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