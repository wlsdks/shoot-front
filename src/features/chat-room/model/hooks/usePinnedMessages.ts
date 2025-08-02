import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getPinnedMessages } from '../../../../shared/api';
import { Message as ChatMessageItem, MessageStatus } from '../../../../entities';
import { QUERY_KEYS, DEFAULT_QUERY_OPTIONS } from '../../../../shared';
import { WebSocketService, PinUpdateMessage } from '../../../../shared/lib/websocket/types';

export const usePinnedMessages = (roomId: number, isConnected: boolean, webSocketService?: WebSocketService | null) => {
    const queryClient = useQueryClient();

    // 고정 메시지 조회 - React Query로 캐싱 및 자동 갱신
    const {
        data: pinnedMessages = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: QUERY_KEYS.MESSAGES.pinned(roomId),
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
                return [pinnedMessages[pinnedMessages.length - 1]]; // 마지막(최신) 1개만 반환
            }
            
            return pinnedMessages;
        },
        enabled: !!roomId && isConnected,
        ...DEFAULT_QUERY_OPTIONS
    });

    // 메시지 고정 mutation (WebSocket 기반)
    const pinMessageMutation = useMutation({
        mutationFn: async (message: ChatMessageItem) => {
            if (!webSocketService?.isConnected()) {
                throw new Error('WebSocket is not connected');
            }
            webSocketService.sendPinToggle(message.id);
            return { message };
        },
        onMutate: async (message: ChatMessageItem) => {
            // 현재 쿼리 취소
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.MESSAGES.pinned(roomId) });

            // 이전 데이터 백업
            const previousData = queryClient.getQueryData<ChatMessageItem[]>(QUERY_KEYS.MESSAGES.pinned(roomId));

            // 🎯 공지사항은 1개만 유지: 새로운 공지사항으로 교체 (기존 것들 모두 제거)
            const formattedMessage: ChatMessageItem = {
                ...message,
                status: MessageStatus.SAVED,
                readBy: message.readBy || {}
            };

            // 기존 공지사항들을 모두 제거하고 새로운 것 1개만 설정
            queryClient.setQueryData<ChatMessageItem[]>(QUERY_KEYS.MESSAGES.pinned(roomId), [formattedMessage]);

            return { previousData };
        },
        onError: (err, message, context) => {
            // 오류시 롤백
            if (context?.previousData) {
                queryClient.setQueryData(QUERY_KEYS.MESSAGES.pinned(roomId), context.previousData);
            }
        },
        onSuccess: () => {
            // 성공시 최신 데이터로 무효화 (선택사항)
            // queryClient.invalidateQueries({ queryKey: ['pinnedMessages', roomId] });
        }
    });

    // 메시지 고정 해제 mutation (WebSocket 기반)
    const unpinMessageMutation = useMutation({
        mutationFn: async (messageId: string) => {
            if (!webSocketService?.isConnected()) {
                throw new Error('WebSocket is not connected');
            }
            webSocketService.sendPinToggle(messageId);
            return { messageId };
        },
        onMutate: async (messageId: string) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.MESSAGES.pinned(roomId) });

            const previousData = queryClient.getQueryData<ChatMessageItem[]>(QUERY_KEYS.MESSAGES.pinned(roomId));

            // Optimistic Update - 즉시 제거
            queryClient.setQueryData<ChatMessageItem[]>(QUERY_KEYS.MESSAGES.pinned(roomId), 
                old => old?.filter(msg => msg.id !== messageId) || []
            );

            return { previousData };
        },
        onError: (err, messageId, context) => {
            // 오류시 롤백
            if (context?.previousData) {
                queryClient.setQueryData(QUERY_KEYS.MESSAGES.pinned(roomId), context.previousData);
            }
        }
    });

    // WebSocket pin 업데이트 구독
    useEffect(() => {
        if (!webSocketService || !isConnected) return;
        
        const handlePinUpdate = (pinUpdate: PinUpdateMessage) => {
            queryClient.setQueryData<ChatMessageItem[]>(
                QUERY_KEYS.MESSAGES.pinned(roomId),
                (old = []) => {
                    if (pinUpdate.isPinned) {
                        // 무엇을 자세하게 추가하는지 알아야 하니 기존 데이터를 invalidate
                        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES.pinned(roomId) });
                        return old; // 임시로 기존 데이터 유지
                    } else {
                        // 고정 해제: 해당 메시지 제거
                        return old.filter(msg => msg.id !== pinUpdate.messageId);
                    }
                }
            );
        };

        webSocketService.onPinUpdate(handlePinUpdate);
        
        // cleanup은 WebSocketService에서 clearAllHandlers로 처리됨
    }, [webSocketService, isConnected, roomId, queryClient]);

    // WebSocket 이벤트로 인한 수동 갱신
    const invalidatePinnedMessages = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES.pinned(roomId) });
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