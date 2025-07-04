import { useState, useRef, useEffect, useCallback } from 'react';
import { useWebSocketMessages } from './useWebSocketMessages';
import { createWebSocketService } from '../websocket';
import { Message } from '../../../entities';

export interface UseChatRoomProps {
    roomId: string;
    userId: number;
    onConnectionError?: (error: string) => void;
    onConnectionRestore?: () => void;
}

export interface UseChatRoomReturn {
    // 메시지 관련
    messages: Message[];
    messageStatuses: Record<string, any>;
    hasMoreMessages: boolean;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    
    // 타이핑 관련
    typingUsers: Record<number, { username?: string; isTyping: boolean }>;
    
    // 연결 상태
    isConnected: boolean;
    connectionError: string | null;
    
    // WebSocket 작업
    sendMessage: (message: Message) => void;
    requestSync: (lastMessageId?: string, direction?: "INITIAL" | "BEFORE" | "AFTER", limit?: number) => void;
    markAllAsRead: () => void;
    sendTypingIndicator: (isTyping: boolean) => void;
    
    // 연결 관리
    connectWebSocket: () => Promise<void>;
    disconnectWebSocket: () => void;
    
    // Refs
    messagesRef: React.MutableRefObject<Message[]>;
    firstVisibleMessageRef: React.MutableRefObject<string | null>;
    webSocketService: React.MutableRefObject<any>;
}

export const useChatRoom = ({
    roomId,
    userId,
    onConnectionError,
    onConnectionRestore
}: UseChatRoomProps): UseChatRoomReturn => {
    // State
    const [connectionError, setConnectionError] = useState<string | null>(null);
    
    // WebSocket service 관리
    const webSocketService = useRef(createWebSocketService());
    
    // WebSocket 메시지 관리 hook 사용
    const {
        messages,
        messageStatuses,
        typingUsers,
        isConnected,
        hasMoreMessages,
        setMessages,
        sendMessage,
        requestSync,
        markAllAsRead,
        messagesRef,
        firstVisibleMessageRef
    } = useWebSocketMessages({
        webSocketService: webSocketService.current,
        roomId,
        userId,
        onConnectionError: (error) => {
            setConnectionError(error);
            onConnectionError?.(error);
        },
        onConnectionRestore: () => {
            setConnectionError(null);
            onConnectionRestore?.();
        }
    });
    
    // 재연결 관리
    const reconnectAttemptRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000;
    
    // WebSocket 연결
    const connectWebSocket = useCallback(async () => {
        try {
            // roomId 유효성 검사
            const numericRoomId = Number(roomId);
            if (isNaN(numericRoomId)) {
                setConnectionError("유효하지 않은 채팅방 ID입니다.");
                return;
            }
            
            // 이미 연결 중이거나 연결된 상태라면 중복 연결 방지
            if (webSocketService.current.isConnected() || 
                (webSocketService.current as any).getIsConnecting?.()) {
                return;
            }
            
            // 기존 핸들러들 모두 제거
            webSocketService.current.clearAllHandlers();
            
            await webSocketService.current.connect(numericRoomId, userId);
            setConnectionError(null);
            reconnectAttemptRef.current = 0;
            
        } catch (error) {
            console.error("WebSocket connection failed:", error);
            setConnectionError("연결 실패: 재연결을 시도합니다...");
            
            // 재연결 시도
            if (reconnectAttemptRef.current < maxReconnectAttempts) {
                reconnectAttemptRef.current++;
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }
                reconnectTimeoutRef.current = setTimeout(connectWebSocket, reconnectDelay);
            } else {
                setConnectionError("연결 실패: 새로고침 후 다시 시도해주세요.");
            }
        }
    }, [roomId, userId]);
    
    // WebSocket 연결 해제
    const disconnectWebSocket = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        webSocketService.current.disconnect();
    }, []);
    
    // 타이핑 인디케이터 전송
    const sendTypingIndicator = useCallback((isTyping: boolean) => {
        if (webSocketService.current?.isConnected()) {
            webSocketService.current.sendTypingIndicator(isTyping);
        }
    }, []);
    
    // 네트워크 상태 변화 감지
    useEffect(() => {
        const handleOnline = () => {
            if (!webSocketService.current.isConnected()) {
                setConnectionError("재연결 시도 중...");
                reconnectAttemptRef.current = 0;
                connectWebSocket();
            }
        };
    
        const handleOffline = () => {
            setConnectionError("네트워크 연결이 끊어졌습니다. 자동 재연결 대기 중...");
        };
    
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
    
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [connectWebSocket]);
    
    // 초기 연결
    useEffect(() => {
        if (roomId && userId) {
            connectWebSocket();
        }
        
        return () => {
            disconnectWebSocket();
        };
    }, [roomId, userId, connectWebSocket, disconnectWebSocket]);
    
    return {
        // 메시지 관련
        messages,
        messageStatuses,
        hasMoreMessages,
        setMessages,
        
        // 타이핑 관련
        typingUsers,
        
        // 연결 상태
        isConnected,
        connectionError,
        
        // WebSocket 작업
        sendMessage,
        requestSync,
        markAllAsRead,
        sendTypingIndicator,
        
        // 연결 관리
        connectWebSocket,
        disconnectWebSocket,
        
        // Refs
        messagesRef,
        firstVisibleMessageRef,
        webSocketService
    };
}; 