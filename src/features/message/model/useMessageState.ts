import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessageItem, MessageStatusInfo } from '../types/ChatRoom.types';

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
            
            // 메시지에 저장된 상태 정보 적용
            let messageToAdd = {...newMsg, readBy: newMsg.readBy || {}};
            if (newMsg.tempId && messageStatuses[newMsg.tempId]) {
                const statusInfo = messageStatuses[newMsg.tempId];
                messageToAdd = {
                    ...messageToAdd,
                    status: statusInfo.status,
                    id: statusInfo.persistedId || messageToAdd.id
                };
                console.log("메시지 추가 시 저장된 상태 적용:", {
                    tempId: newMsg.tempId,
                    originalStatus: newMsg.status,
                    appliedStatus: statusInfo.status,
                    persistedId: statusInfo.persistedId
                });
            }
            
            return [...prev, messageToAdd];
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