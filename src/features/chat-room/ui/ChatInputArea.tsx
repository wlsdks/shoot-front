import React from 'react';
import { ChatInputContainer, Input, SendButton, TypingIndicatorContainer, TypingDots } from '../../message/ui/styles/ChatRoom.styles';
import { SendIcon } from '../../message/ui/icons';
// TypingUser 타입 정의
interface TypingUser {
    userId: number;
    username: string;
    isTyping: boolean;
}

interface ChatInputAreaProps {
    input: string;
    isConnected: boolean;
    typingUsers: { [key: string]: TypingUser };
    userId: number | undefined;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onCompositionStart: () => void;
    onCompositionEnd: () => void;
    onBlur: () => void;
    onSendMessage: () => void;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
    input,
    isConnected,
    typingUsers,
    userId,
    onInputChange,
    onKeyDown,
    onCompositionStart,
    onCompositionEnd,
    onBlur,
    onSendMessage
}) => {
    const otherTypingUsers = Object.values(typingUsers).filter(typingUser => 
        String(typingUser.userId) !== String(userId)
    );

    return (
        <ChatInputContainer>
            <Input
                type="text"
                value={input}
                onChange={onInputChange}
                onKeyDown={onKeyDown}
                onCompositionStart={onCompositionStart}
                onCompositionEnd={onCompositionEnd}
                onBlur={onBlur}
                placeholder="메시지를 입력하세요"
                disabled={!isConnected}
            />
            <SendButton onClick={onSendMessage} disabled={!isConnected}>
                <SendIcon />
            </SendButton>
            {otherTypingUsers.length > 0 && (
                <TypingIndicatorContainer className="visible">
                    {otherTypingUsers.length > 1 
                        ? `${otherTypingUsers.length}명이 타이핑 중입니다`
                        : '상대방이 타이핑 중입니다'
                    }
                    <TypingDots>
                        <span></span>
                        <span></span>
                        <span></span>
                    </TypingDots>
                </TypingIndicatorContainer>
            )}
        </ChatInputContainer>
    );
}; 