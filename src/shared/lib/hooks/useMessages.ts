import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, forwardMessage, forwardMessageToUser } from '../../../features/chat/api/message';

export const useMessages = (roomId: number) => {
    const queryClient = useQueryClient();

    // 채팅 메시지 조회
    const { data: messages, isLoading, error } = useQuery({
        queryKey: ['messages', roomId],
        queryFn: () => getChatMessages(roomId),
        // 실시간 채팅을 위해 주기적으로 갱신
        refetchInterval: 5000, // 5초마다 갱신
    });

    // 메시지 전달
    const forwardMessageMutation = useMutation({
        mutationFn: ({ 
        originalMessageId, 
        targetRoomId, 
        forwardingUserId 
        }: { 
        originalMessageId: string;
        targetRoomId: number;
        forwardingUserId: number;
        }) => forwardMessage(originalMessageId, targetRoomId, forwardingUserId),
        onSuccess: () => {
        // 메시지 목록 새로고침
        queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
        },
    });

    // 사용자에게 직접 메시지 전달
    const forwardToUserMutation = useMutation({
        mutationFn: ({ 
        originalMessageId, 
        targetUserId, 
        forwardingUserId 
        }: { 
        originalMessageId: string;
        targetUserId: number;
        forwardingUserId: number;
        }) => forwardMessageToUser(originalMessageId, targetUserId, forwardingUserId),
    });

    return {
        messages,
        isLoading,
        error,
        forwardMessage: forwardMessageMutation.mutate,
        forwardToUser: forwardToUserMutation.mutate,
    };
}; 