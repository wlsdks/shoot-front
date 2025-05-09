import { useCallback } from 'react';
import { WebSocketService } from '../../../shared/api/websocket/types';
import { TypingIndicatorMessage } from '../types/ChatRoom.types';

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
    const handleTypingIndicator = useCallback((typingMsg: TypingIndicatorMessage) => {
        if (typingMsg.userId !== userId) {
            updateTypingStatus(typingMsg);
        }
    }, [userId, updateTypingStatus]);

    const sendTypingIndicator = useCallback((isTyping: boolean) => {
        if (!webSocketService.current.isConnected() || !roomId || !userId) return;
        webSocketService.current.sendTypingIndicator(isTyping);
    }, [webSocketService, roomId, userId]);

    return {
        handleTypingIndicator,
        sendTypingIndicator
    };
}; 