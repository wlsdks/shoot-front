import { useCallback } from 'react';
import { ChatMessageItem, MessageStatus } from './types/ChatRoom.types';
import { WebSocketService } from '../api/websocket/types';

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
    }, [userId, updateMessages, messageStatuses]);

    const handleMessageStatus = useCallback((update: any) => {
        const statusUpdate = Array.isArray(update) 
            ? update[update.length - 1] 
            : update;
        
        if (!statusUpdate || !statusUpdate.tempId) return;

        setMessageStatuses((prev) => {
            const existingStatus = prev[statusUpdate.tempId] || {};
            const newStatus = {
                status: statusUpdate.status,
                persistedId: statusUpdate.persistedId || existingStatus.persistedId,
                createdAt: statusUpdate.createdAt || existingStatus.createdAt
            };
            
            return {
                ...prev,
                [statusUpdate.tempId]: newStatus
            };
        });

        setMessages((prev) => {
            const messageMap = new Map<string, ChatMessageItem>();
            
            prev.forEach(msg => {
                if (msg.tempId === statusUpdate.tempId) return;
                messageMap.set(msg.id, msg);
            });

            const updatedMsg = prev.find(msg => msg.tempId === statusUpdate.tempId);
            if (updatedMsg) {
                const newMsg = {
                    ...updatedMsg,
                    status: statusUpdate.status,
                    id: statusUpdate.persistedId || updatedMsg.id
                };
                messageMap.set(newMsg.id, newMsg);
            }

            return Array.from(messageMap.values()).sort((a, b) => 
                new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
            );
        });

        if (statusUpdate.status === MessageStatus.SAVED && statusUpdate.persistedId) {
            const currentMsg = messagesRef.current.find(m => m.tempId === statusUpdate.tempId);
            if (currentMsg && !currentMsg.readBy[userId!] && currentMsg.senderId !== userId) {
                webSocketService.current.sendMessage({
                    ...currentMsg,
                    id: statusUpdate.persistedId
                });
            }
        }
    }, [userId, setMessageStatuses, setMessages, messagesRef]);

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