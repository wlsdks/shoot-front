import { useState, useCallback, useRef, useEffect } from 'react';
import { MessageStatus, ChatMessageItem, MessageStatusInfo } from '../types/ChatRoom.types';

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

    const updateMessages = useCallback((newMsg: ChatMessageItem) => {
        setMessages(prev => {
            const messageMap = new Map<string, ChatMessageItem>();
            prev.forEach(msg => {
                if (msg.id) messageMap.set(msg.id, msg);
                if (msg.tempId) messageMap.set(msg.tempId, msg);
            });
            
            if (newMsg.id && messageMap.has(newMsg.id) || 
                newMsg.tempId && messageMap.has(newMsg.tempId)) {
                return prev;
            }
            
            return [...prev, {...newMsg, readBy: newMsg.readBy || {}}];
        });
    }, []);

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