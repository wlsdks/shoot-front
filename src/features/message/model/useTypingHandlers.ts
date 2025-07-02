import { useCallback, useRef, useMemo } from 'react';
import { debounce } from 'lodash';
import { WebSocketService, TypingIndicatorMessage } from '../../chat-room/api/websocket/types';

interface UseTypingHandlersProps {
    webSocketService: React.MutableRefObject<WebSocketService>;
    roomId: string | undefined;
    userId: number | undefined;
    updateTypingStatus: (typingMsg: TypingIndicatorMessage) => void;
}

export const useTypingHandlers = ({
    webSocketService,
    roomId,
    userId,
    updateTypingStatus
}: UseTypingHandlersProps) => {
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTypingTimeRef = useRef<number>(0);
    
    // 디바운싱된 타이핑 인디케이터 전송 (300ms → 200ms로 최적화)
    const debouncedSendTyping = useMemo(() => 
        debounce((isTyping: boolean) => {
            if (!webSocketService.current?.isConnected() || !roomId || !userId) return;

            const now = Date.now();
            
            // 너무 자주 호출되는 것을 방지 (100ms 최소 간격)
            if (now - lastTypingTimeRef.current < 100) {
                return;
            }
            
            lastTypingTimeRef.current = now;
            
            webSocketService.current.sendTypingIndicator(isTyping);
        }, 200), // 300ms → 200ms로 개선
        [webSocketService, roomId, userId]
    );

    // 타이핑 시작 감지
    const sendTypingIndicator = useCallback((isTyping: boolean) => {
        // 즉시 UI 업데이트
        if (isTyping && userId) {
            updateTypingStatus({
                roomId: Number(roomId),
                userId,
                username: 'me',
                isTyping: true
            });
        }
        
        // 디바운싱된 API 호출
        debouncedSendTyping(isTyping);
        
        // 타이핑 종료 타이머 설정
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        if (isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
                debouncedSendTyping(false);
                if (userId) {
                    updateTypingStatus({
                        roomId: Number(roomId),
                        userId,
                        username: 'me',
                        isTyping: false
                    });
                }
            }, 3000); // 3초 후 자동 타이핑 종료
        }
    }, [debouncedSendTyping, updateTypingStatus, userId, roomId]);

    return {
        sendTypingIndicator
    };
}; 