import { useCallback, useRef } from 'react';
import { ChatMessageItem, MessageStatus } from '../types/ChatRoom.types';
import { WebSocketService } from '../../chat-room/api/websocket/types';

interface UseMessageHandlersProps {
    webSocketService: React.MutableRefObject<WebSocketService>;
    roomId: string | undefined;
    userId: number | undefined;
    updateMessages: (message: ChatMessageItem) => void;
    updateMessageStatus: (tempId: string, status: { status: MessageStatus; persistedId: string | null; createdAt: string }) => void;
    setMessageStatuses: React.Dispatch<React.SetStateAction<Record<string, { status: MessageStatus; persistedId: string | null; createdAt: string }>>>;
    setMessages: React.Dispatch<React.SetStateAction<ChatMessageItem[]>>;
    messagesRef: React.MutableRefObject<ChatMessageItem[]>;
    messageStatuses: Record<string, { status: MessageStatus; persistedId: string | null; createdAt: string }>;
}

export const useMessageHandlers = ({
    webSocketService,
    roomId,
    userId,
    updateMessages,
    updateMessageStatus,
    setMessageStatuses,
    setMessages,
    messagesRef,
    messageStatuses
}: UseMessageHandlersProps) => {
    // 중복 상태 업데이트 방지를 위한 참조
    const lastStatusUpdateRef = useRef<Record<string, { status: string; timestamp: number }>>({});
    // 최근 전송된 메시지들의 tempId 추적
    const recentSentMessagesRef = useRef<string[]>([]);
    const handleMessage = useCallback((msg: ChatMessageItem) => {
        // 내가 보낸 메시지이고 tempId가 있으면 추적 목록에 추가
        if (msg.senderId === userId && msg.tempId) {
            recentSentMessagesRef.current.push(msg.tempId);
            // 최근 10개만 유지
            if (recentSentMessagesRef.current.length > 10) {
                recentSentMessagesRef.current = recentSentMessagesRef.current.slice(-10);
            }
        }
        
        updateMessages(msg);
        
        if (
            document.visibilityState === "visible" &&
            msg.readBy && !msg.readBy[userId!] &&
            msg.senderId !== userId &&
            msg.tempId && messageStatuses[msg.tempId]?.persistedId
        ) {
            webSocketService.current.sendMessage({
                ...msg,
                id: messageStatuses[msg.tempId].persistedId!
            });
        }
    }, [userId, updateMessages, messageStatuses, webSocketService]);

    const handleMessageStatus = useCallback((update: any) => {
        const statusUpdate = Array.isArray(update) 
            ? update[update.length - 1] 
            : update;
        
        if (!statusUpdate || !statusUpdate.tempId) {
            return;
        }

        // 중복 상태 업데이트 방지 (100ms 내 같은 상태는 무시)
        const now = Date.now();
        const lastUpdate = lastStatusUpdateRef.current[statusUpdate.tempId];
        if (lastUpdate && 
            lastUpdate.status === statusUpdate.status && 
            now - lastUpdate.timestamp < 100) {
            return;
        }

        lastStatusUpdateRef.current[statusUpdate.tempId] = {
            status: statusUpdate.status,
            timestamp: now
        };

        // 상태 업데이트 - 실제 변경이 있을 때만
        const existingStatus = messageStatuses[statusUpdate.tempId];
        
        const newStatus = {
            status: statusUpdate.status,
            persistedId: statusUpdate.persistedId || existingStatus?.persistedId,
            createdAt: statusUpdate.createdAt || existingStatus?.createdAt
        };
        
        // 상태가 실제로 변경된 경우에만 업데이트
        const hasStatusChanged = !existingStatus || 
            existingStatus.status !== newStatus.status || 
            existingStatus.persistedId !== newStatus.persistedId;
            
        if (!hasStatusChanged) {
            return;
        }
        
        setMessageStatuses((prev) => ({
            ...prev,
            [statusUpdate.tempId]: newStatus
        }));

        // 메시지 업데이트 - 메시지가 있는 경우 즉시 적용, 없으면 대안 매칭 시도
        let targetMessage = messagesRef.current.find(msg => msg.tempId === statusUpdate.tempId);
        
        if (!targetMessage) {
            // 최근 전송된 메시지 중에서 아직 상태가 SENDING인 메시지 찾기
            const pendingMessage = messagesRef.current
                .filter(msg => msg.senderId === userId && msg.status === "SENDING")
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                
            if (pendingMessage) {
                targetMessage = pendingMessage;
                
                // 이 경우 실제 tempId를 업데이트하여 향후 매칭이 가능하도록 함
                setMessages((prev) => 
                    prev.map(msg => 
                        msg.tempId === pendingMessage.tempId 
                            ? { 
                                ...msg, 
                                tempId: statusUpdate.tempId, // 서버 tempId로 업데이트
                                status: statusUpdate.status,
                                id: statusUpdate.persistedId || msg.id 
                            }
                            : msg
                    )
                );
                return;
            }
            
            // 100ms 후에 다시 시도
            setTimeout(() => {
                const delayedTargetMessage = messagesRef.current.find(msg => msg.tempId === statusUpdate.tempId);
                if (delayedTargetMessage) {
                    setMessages((prev) => 
                        prev.map(msg => 
                            msg.tempId === statusUpdate.tempId 
                                ? { 
                                    ...msg, 
                                    status: statusUpdate.status,
                                    id: statusUpdate.persistedId || msg.id 
                                }
                                : msg
                        )
                    );
                }
            }, 100);
            return;
        }

        setMessages((prev) => {
            const updatedMessages = prev.map(msg => {
                if (msg.tempId === statusUpdate.tempId) {
                    const updatedMsg = {
                        ...msg,
                        status: statusUpdate.status,
                        id: statusUpdate.persistedId || msg.id
                    };
                    return updatedMsg;
                }
                return msg;
            });
            
            return updatedMessages;
        });

        // 실패 상태 처리
        if (statusUpdate.status === MessageStatus.FAILED) {
            console.error("메시지 전송 실패:", statusUpdate);
        }

        // 읽음 처리 로직
        if (statusUpdate.status === MessageStatus.SAVED && statusUpdate.persistedId) {
            const currentMsg = messagesRef.current.find(m => m.tempId === statusUpdate.tempId);
            if (currentMsg && !currentMsg.readBy[userId!] && currentMsg.senderId !== userId) {
                webSocketService.current.sendMessage({
                    ...currentMsg,
                    id: statusUpdate.persistedId
                });
            }
        }
    }, [userId, setMessageStatuses, setMessages, messagesRef, webSocketService, messageStatuses]);

    const handleMessageUpdate = useCallback((updatedMessage: ChatMessageItem) => {
        setMessages((prevMessages) => 
            prevMessages.map((msg) => 
                msg.id === updatedMessage.id ? updatedMessage : msg
            )
        );
    }, [setMessages]);

    const handleReadBulk = useCallback(({ messageIds, userId }: { messageIds: string[], userId: number }) => {
        setMessages((prev) =>
            prev.map((msg) =>
                messageIds.includes(msg.id)
                    ? { ...msg, readBy: { ...msg.readBy, [userId]: true } }
                    : msg
            )
        );
    }, [setMessages]);

    return {
        handleMessage,
        handleMessageStatus,
        handleMessageUpdate,
        handleReadBulk
    };
}; 