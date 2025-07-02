import { useState, useCallback, useRef, useEffect } from 'react';
import { Message as ChatMessageItem, MessageStatusInfo } from '../../../entities';

export const useMessageState = () => {
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [messageStatuses, setMessageStatuses] = useState<{ [key: string]: MessageStatusInfo }>({});
    const [messageDirection, setMessageDirection] = useState<"INITIAL" | "BEFORE" | "AFTER" | "new">("INITIAL");
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const messagesRef = useRef<ChatMessageItem[]>([]);
    const chatAreaRef = useRef<HTMLDivElement>(null);

    const updateMessageStatus = useCallback((tempId: string, statusInfo: MessageStatusInfo) => {
        setMessageStatuses(prev => ({
            ...prev,
            [tempId]: statusInfo
        }));
    }, []);

    const getMessageStatus = useCallback((tempId: string): MessageStatusInfo | undefined => {
        return messageStatuses[tempId];
    }, [messageStatuses]);

    const updateMessages = useCallback((newMessage: ChatMessageItem) => {
        setMessages((prevMessages) => {
            const existingIndex = prevMessages.findIndex(
                (msg) => msg.id === newMessage.id || msg.tempId === newMessage.tempId
            );

            if (existingIndex !== -1) {
                return prevMessages.map((msg, index) =>
                    index === existingIndex ? newMessage : msg
                );
            }

            // 새 메시지인 경우 추가하고 상태 적용
            const messageWithStatus = { ...newMessage };
            const existingStatus = messageStatuses[newMessage.tempId!];
            if (existingStatus) {
                messageWithStatus.status = existingStatus.status;
                if (existingStatus.persistedId) {
                    messageWithStatus.id = existingStatus.persistedId;
                }
            }

            return [...prevMessages, messageWithStatus]
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
    }, [messageStatuses]);

    // messagesRef 업데이트
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    return {
        messages,
        messageStatuses,
        messageDirection,
        initialLoadComplete,
        setMessageDirection,
        setInitialLoadComplete,
        updateMessages,
        updateMessageStatus,
        getMessageStatus,
        setMessages,
        setMessageStatuses,
        messagesRef,
        chatAreaRef
    };
}; 