import { useState, useRef, useCallback, useEffect } from 'react';
import { WebSocketService, Message, TypingIndicatorMessage, MessageStatusUpdate } from '../websocket';

export interface MessageStatus {
    status: string;
    messageId?: string;
    persistedId?: string;
    createdAt?: string;
}

export interface UseWebSocketMessagesProps {
    webSocketService: WebSocketService;
    roomId: string | number;
    userId: number;
    onConnectionError?: (error: string) => void;
    onConnectionRestore?: () => void;
}

export interface UseWebSocketMessagesReturn {
    messages: Message[];
    messageStatuses: Record<string, MessageStatus>;
    typingUsers: Record<number, { username?: string; isTyping: boolean }>;
    isConnected: boolean;
    hasMoreMessages: boolean;
    
    // Actions
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    setMessageStatuses: React.Dispatch<React.SetStateAction<Record<string, MessageStatus>>>;
    updateTypingStatus: (typingMsg: TypingIndicatorMessage) => void;
    setHasMoreMessages: React.Dispatch<React.SetStateAction<boolean>>;
    
    // WebSocket operations
    sendMessage: (message: Message) => void;
    requestSync: (lastMessageId?: string, direction?: "INITIAL" | "BEFORE" | "AFTER", limit?: number) => void;
    markAllAsRead: () => void;
    
    // Refs for external access
    messagesRef: React.MutableRefObject<Message[]>;
    firstVisibleMessageRef: React.MutableRefObject<string | null>;
}

export const useWebSocketMessages = ({
    webSocketService,
    roomId,
    userId,
    onConnectionError,
    onConnectionRestore
}: UseWebSocketMessagesProps): UseWebSocketMessagesReturn => {
    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageStatuses, setMessageStatuses] = useState<Record<string, MessageStatus>>({});
    const [typingUsers, setTypingUsers] = useState<Record<number, { username?: string; isTyping: boolean }>>({});
    const [isConnected, setIsConnected] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    
    // Refs
    const messagesRef = useRef<Message[]>([]);
    const firstVisibleMessageRef = useRef<string | null>(null);
    const typingTimeoutRef = useRef<Record<number, NodeJS.Timeout>>({});
    const lastStatusUpdateRef = useRef<Record<string, { status: string; timestamp: number }>>({});
    
    // Update messagesRef when messages change
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);
    
    // Typing status management
    const updateTypingStatus = useCallback((typingMsg: TypingIndicatorMessage) => {
        const { userId: typingUserId, isTyping, username } = typingMsg;
        
        if (typingUserId === userId) return; // 자신의 타이핑은 무시
        
        // 기존 타이머 정리
        if (typingTimeoutRef.current[typingUserId]) {
            clearTimeout(typingTimeoutRef.current[typingUserId]);
        }
        
        setTypingUsers(prev => ({
            ...prev,
            [typingUserId]: { username, isTyping }
        }));
        
        // 타이핑 상태가 true일 때만 자동 제거 타이머 설정
        if (isTyping) {
            typingTimeoutRef.current[typingUserId] = setTimeout(() => {
                setTypingUsers(prev => ({
                    ...prev,
                    [typingUserId]: { username, isTyping: false }
                }));
            }, 3000);
        }
    }, [userId]);
    
    // Message status handling
    const handleMessageStatus = useCallback((update: MessageStatusUpdate) => {
        if (!update || !update.tempId) return;
        
        // 중복 상태 업데이트 방지
        const now = Date.now();
        const lastUpdate = lastStatusUpdateRef.current[update.tempId];
        if (lastUpdate && 
            lastUpdate.status === update.status.toString() && 
            now - lastUpdate.timestamp < 100) {
            return;
        }
        
        lastStatusUpdateRef.current[update.tempId] = {
            status: update.status.toString(),
            timestamp: now
        };
        
        // 상태 업데이트
        const existingStatus = messageStatuses[update.tempId];
        const newStatus = {
            status: update.status.toString(),
            messageId: update.messageId || existingStatus?.messageId,
            persistedId: update.messageId || existingStatus?.persistedId,
            createdAt: existingStatus?.createdAt
        };
        
        // 실제 변경이 있을 때만 업데이트
        const hasStatusChanged = !existingStatus || 
            existingStatus.status !== newStatus.status || 
            existingStatus.messageId !== newStatus.messageId;
            
        if (hasStatusChanged) {
            setMessageStatuses(prev => ({
                ...prev,
                [update.tempId]: newStatus
            }));
        }
        
        // 메시지 업데이트
        if (update.messageId) {
            setMessages(prev => 
                prev.map(msg => 
                    msg.tempId === update.tempId 
                        ? { ...msg, id: update.messageId, status: update.status }
                        : msg
                )
            );
        }
    }, [messageStatuses]);
    
    // WebSocket operations
    const sendMessage = useCallback((message: Message) => {
        if (webSocketService && webSocketService.isConnected()) {
            webSocketService.sendMessage(message);
        }
    }, [webSocketService]);
    
    const requestSync = useCallback((lastMessageId?: string, direction: "INITIAL" | "BEFORE" | "AFTER" = "INITIAL", limit?: number) => {
        if (webSocketService && webSocketService.isConnected()) {
            webSocketService.requestSync(lastMessageId, direction, limit);
        }
    }, [webSocketService]);
    
    const markAllAsRead = useCallback(() => {
        if (webSocketService && webSocketService.isConnected()) {
            webSocketService.markAllMessagesAsRead();
        }
    }, [webSocketService]);
    
    // Setup WebSocket event handlers
    useEffect(() => {
        if (!webSocketService) return;
        
        // effect 시작 시점에 ref 값을 변수에 저장
        const currentTypingTimeouts = typingTimeoutRef.current;
        
        // 연결 상태 모니터링
        const checkConnection = () => {
            const connected = webSocketService.isConnected();
            setIsConnected(connected);
            
            if (connected && onConnectionRestore) {
                onConnectionRestore();
            } else if (!connected && onConnectionError) {
                onConnectionError("연결이 끊어졌습니다.");
            }
        };
        
        // 초기 연결 상태 확인
        checkConnection();
        
        // 정기적 연결 상태 확인 (5초마다)
        const connectionCheckInterval = setInterval(checkConnection, 5000);
        
        // 이벤트 핸들러 등록
        webSocketService.onMessage((message: Message) => {
            setMessages(prev => {
                // 중복 메시지 방지
                const exists = prev.some(msg => msg.id === message.id);
                if (exists) return prev;
                
                return [...prev, message];
            });
        });
        
        webSocketService.onMessageStatus(handleMessageStatus);
        webSocketService.onTypingIndicator(updateTypingStatus);
        
        webSocketService.onMessageUpdate((updatedMessage: Message) => {
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
                )
            );
        });
        
        webSocketService.onRead((data: { messageId: string, userId: number, readBy: Record<string, boolean> }) => {
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === data.messageId 
                        ? { ...msg, readBy: { ...msg.readBy, [data.userId]: true } }
                        : msg
                )
            );
        });
        
        return () => {
            clearInterval(connectionCheckInterval);
            // 타이핑 타이머 정리 - effect 시작 시점에 저장한 ref 값 사용
            Object.values(currentTypingTimeouts).forEach(clearTimeout);
        };
    }, [webSocketService, handleMessageStatus, updateTypingStatus, onConnectionError, onConnectionRestore]);
    
    return {
        messages,
        messageStatuses,
        typingUsers,
        isConnected,
        hasMoreMessages,
        
        setMessages,
        setMessageStatuses,
        updateTypingStatus,
        setHasMoreMessages,
        
        sendMessage,
        requestSync,
        markAllAsRead,
        
        messagesRef,
        firstVisibleMessageRef
    };
}; 