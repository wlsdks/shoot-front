import { useState, useCallback, useRef } from 'react';
import { TypingIndicatorMessage } from '../../../entities';

export const useTypingState = () => {
    const [typingUsers, setTypingUsers] = useState<{ [key: string]: TypingIndicatorMessage }>({});
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateTypingStatus = useCallback((message: TypingIndicatorMessage) => {
        setTypingUsers(prev => {
            if (message.isTyping) {
                return {
                    ...prev,
                    [message.userId]: message
                };
            } else {
                const newState = { ...prev };
                delete newState[message.userId];
                return newState;
            }
        });
    }, []);

    const removeTypingUser = useCallback((userId: number) => {
        setTypingUsers(prev => {
            const newState = { ...prev };
            delete newState[userId];
            return newState;
        });
    }, []);


    return {
        typingUsers,
        setTypingUsers,
        typingTimeoutRef,
        updateTypingStatus,
        removeTypingUser
    };
}; 