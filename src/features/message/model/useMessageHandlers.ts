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
    const handleMessage = useCallback((msg: ChatMessageItem) => {
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
            console.log("Invalid status update:", statusUpdate);
            return;
        }

        console.log("메시지 상태 업데이트 수신:", statusUpdate);

        // 중복 상태 업데이트 방지 (100ms 내 같은 상태는 무시)
        const now = Date.now();
        const lastUpdate = lastStatusUpdateRef.current[statusUpdate.tempId];
        if (lastUpdate && 
            lastUpdate.status === statusUpdate.status && 
            now - lastUpdate.timestamp < 100) {
            console.log("중복 상태 업데이트 무시:", statusUpdate);
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
            console.log("상태 변경 없음 - 업데이트 스킵:", { tempId: statusUpdate.tempId, currentStatus: existingStatus?.status });
            return;
        }
        
        console.log("상태 업데이트:", { tempId: statusUpdate.tempId, oldStatus: existingStatus, newStatus });
        
        setMessageStatuses((prev) => ({
            ...prev,
            [statusUpdate.tempId]: newStatus
        }));

        // 메시지 업데이트 - 메시지가 있는 경우에만
        const targetMessage = messagesRef.current.find(msg => msg.tempId === statusUpdate.tempId);
        if (!targetMessage) {
            console.warn("메시지를 찾을 수 없음 - 상태 업데이트만 저장:", {
                tempId: statusUpdate.tempId,
                status: statusUpdate.status,
                totalMessages: messagesRef.current.length,
                messageIds: messagesRef.current.slice(-3).map(m => ({ id: m.id, tempId: m.tempId }))
            });
            // 메시지가 없어도 상태는 저장되어 있으므로 나중에 메시지가 추가될 때 적용됨
            return;
        }

        setMessages((prev) => {
            console.log("메시지 업데이트 시작 - 현재 메시지 수:", prev.length);
            
            const updatedMessages = prev.map(msg => {
                if (msg.tempId === statusUpdate.tempId) {
                    const updatedMsg = {
                        ...msg,
                        status: statusUpdate.status,
                        id: statusUpdate.persistedId || msg.id
                    };
                    console.log("메시지 업데이트 적용:", { 
                        tempId: statusUpdate.tempId,
                        oldMsg: { id: msg.id, tempId: msg.tempId, status: msg.status }, 
                        updatedMsg: { id: updatedMsg.id, tempId: updatedMsg.tempId, status: updatedMsg.status },
                        statusUpdate 
                    });
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
    }, [userId, setMessageStatuses, setMessages, messagesRef, webSocketService]);

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