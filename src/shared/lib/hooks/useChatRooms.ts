import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatRooms, updateChatRoomFavorite } from '../../../features/chat/api/chatRoom';

export const useChatRooms = (userId: number) => {
    const queryClient = useQueryClient();

    // 채팅방 목록 조회
    const { data: chatRooms, isLoading, error } = useQuery({
        queryKey: ['chatRooms', userId],
        queryFn: () => getChatRooms(userId),
    });

    // 채팅방 즐겨찾기 상태 업데이트
    const updateFavorite = useMutation({
        mutationFn: ({ roomId, isFavorite }: { roomId: number; isFavorite: boolean }) =>
            updateChatRoomFavorite(roomId, userId, isFavorite),
            onSuccess: () => {
            // 채팅방 목록 새로고침
            queryClient.invalidateQueries({ queryKey: ['chatRooms', userId] });
        },
    });

    return {
        chatRooms,
        isLoading,
        error,
        updateFavorite,
    };
}; 