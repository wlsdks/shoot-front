import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPinnedMessages, pinMessage, unpinMessage } from '../../../message/api/message';
import { ChatMessageItem, MessageStatus } from '../../../message/types/ChatRoom.types';
import { API_CONFIG } from '../../../../shared/api/config';

export const usePinnedMessages = (roomId: number, isConnected: boolean) => {
    const queryClient = useQueryClient();

    // 고정 메시지 조회 - React Query로 캐싱 및 자동 갱신
    const {
        data: pinnedMessages = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['pinnedMessages', roomId],
        queryFn: async () => {
            const response = await getPinnedMessages(roomId);
            
            let pinnedMessages: ChatMessageItem[] = [];
            
            if (response && response.data && Array.isArray(response.data.pinnedMessages)) {
                pinnedMessages = response.data.pinnedMessages.map((pinMsg: {
                    messageId: string;
                    content: string;
                    senderId: string;
                    pinnedBy: string;
                    pinnedAt: string;
                    createdAt: string;
                }) => ({
                    id: pinMsg.messageId,
                    roomId: response.data.roomId,
                    senderId: pinMsg.senderId,
                    content: {
                        text: pinMsg.content,
                        type: "TEXT",
                        attachments: [],
                        isEdited: false,
                        isDeleted: false
                    },
                    createdAt: pinMsg.createdAt,
                    status: "SAVED",
                    readBy: {}
                })) as ChatMessageItem[];
            } else if (response && Array.isArray(response.data)) {
                pinnedMessages = response.data as ChatMessageItem[];
            } else {
                console.error("Unexpected pinned messages format:", response);
                return [];
            }

            // 🎯 안전장치: 백엔드에서 여러 공지사항이 와도 최신 1개만 유지
            if (pinnedMessages.length > 1) {
                console.log("🔧 백엔드에서 여러 공지사항 수신, 최신 1개만 유지:", {
                    전체수: pinnedMessages.length,
                    최신ID: pinnedMessages[pinnedMessages.length - 1].id
                });
                return [pinnedMessages[pinnedMessages.length - 1]]; // 마지막(최신) 1개만 반환
            }
            
            return pinnedMessages;
        },
        enabled: !!roomId && isConnected,
        staleTime: API_CONFIG.QUERY_STALE_TIME.MEDIUM, // 5분 캐시
        gcTime: API_CONFIG.QUERY_STALE_TIME.LONG, // 30분 가비지 컬렉션
        refetchOnWindowFocus: false,
        retry: 2,
    });

    // 메시지 고정 mutation (Optimistic Update)
    const pinMessageMutation = useMutation({
        mutationFn: async (message: ChatMessageItem) => {
            const response = await pinMessage(message.id);
            return { response, message };
        },
        onMutate: async (message: ChatMessageItem) => {
            // 현재 쿼리 취소
            await queryClient.cancelQueries({ queryKey: ['pinnedMessages', roomId] });

            // 이전 데이터 백업
            const previousData = queryClient.getQueryData<ChatMessageItem[]>(['pinnedMessages', roomId]);

            // 🎯 공지사항은 1개만 유지: 새로운 공지사항으로 교체 (기존 것들 모두 제거)
            const formattedMessage: ChatMessageItem = {
                ...message,
                status: MessageStatus.SAVED,
                readBy: message.readBy || {}
            };

            console.log("📌 공지사항 교체 (1개만 유지):", {
                기존공지수: previousData?.length || 0,
                새공지ID: formattedMessage.id,
                새공지내용: formattedMessage.content?.text
            });

            // 기존 공지사항들을 모두 제거하고 새로운 것 1개만 설정
            queryClient.setQueryData<ChatMessageItem[]>(['pinnedMessages', roomId], [formattedMessage]);

            return { previousData };
        },
        onError: (err, message, context) => {
            // 오류시 롤백
            if (context?.previousData) {
                queryClient.setQueryData(['pinnedMessages', roomId], context.previousData);
            }
        },
        onSuccess: () => {
            // 성공시 최신 데이터로 무효화 (선택사항)
            // queryClient.invalidateQueries({ queryKey: ['pinnedMessages', roomId] });
        }
    });

    // 메시지 고정 해제 mutation (Optimistic Update)
    const unpinMessageMutation = useMutation({
        mutationFn: async (messageId: string) => {
            const response = await unpinMessage(messageId);
            return { response, messageId };
        },
        onMutate: async (messageId: string) => {
            await queryClient.cancelQueries({ queryKey: ['pinnedMessages', roomId] });

            const previousData = queryClient.getQueryData<ChatMessageItem[]>(['pinnedMessages', roomId]);

            // Optimistic Update - 즉시 제거
            queryClient.setQueryData<ChatMessageItem[]>(['pinnedMessages', roomId], 
                old => old?.filter(msg => msg.id !== messageId) || []
            );

            return { previousData };
        },
        onError: (err, messageId, context) => {
            // 오류시 롤백
            if (context?.previousData) {
                queryClient.setQueryData(['pinnedMessages', roomId], context.previousData);
            }
        }
    });

    // WebSocket 이벤트로 인한 수동 갱신
    const invalidatePinnedMessages = () => {
        queryClient.invalidateQueries({ queryKey: ['pinnedMessages', roomId] });
    };

    return {
        pinnedMessages,
        isLoading,
        error,
        pinMessage: pinMessageMutation.mutate,
        unpinMessage: unpinMessageMutation.mutate,
        isPinning: pinMessageMutation.isPending,
        isUnpinning: unpinMessageMutation.isPending,
        invalidatePinnedMessages,
        refetch
    };
}; 