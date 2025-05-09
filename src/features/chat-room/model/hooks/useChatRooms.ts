import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatRoom } from '../../../message/model/types/ChatRoom.types';
import { getChatRooms, updateFavorite } from '../../api/chatRoom';

export const useChatRooms = (userId: number) => {
    const queryClient = useQueryClient();

    const chatRooms = useQuery({
        queryKey: ['chatRooms', userId],
        queryFn: () => getChatRooms(userId)
    });

    const updateFavoriteMutation = useMutation({
        mutationFn: ({ roomId, isFavorite }: { roomId: number; isFavorite: boolean }) =>
            updateFavorite(roomId, isFavorite),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chatRooms', userId] });
        }
    });

    return {
        chatRooms: chatRooms.data,
        isLoading: chatRooms.isLoading,
        error: chatRooms.error,
        updateFavorite: updateFavoriteMutation
    };
}; 