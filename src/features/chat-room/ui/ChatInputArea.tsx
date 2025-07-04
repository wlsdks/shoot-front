import React, { memo } from 'react';
import { ChatInputContainer, Input, SendButton, TypingIndicatorContainer, TypingDots } from '../styles/ChatRoom.styles';
import { SendIcon } from './icons';
import { TypingUser } from '../../../shared';

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

const ChatInputAreaComponent: React.FC<ChatInputAreaProps> = ({
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

// React.memo로 렌더링 최적화
export const ChatInputArea = memo(ChatInputAreaComponent, (prevProps: ChatInputAreaProps, nextProps: ChatInputAreaProps) => {
    // 입력값이나 연결 상태, 타이핑 사용자가 변경될 때만 리렌더링
    return (
        prevProps.input === nextProps.input &&
        prevProps.isConnected === nextProps.isConnected &&
        prevProps.typingUsers === nextProps.typingUsers &&
        prevProps.userId === nextProps.userId &&
        prevProps.onInputChange === nextProps.onInputChange &&
        prevProps.onKeyDown === nextProps.onKeyDown &&
        prevProps.onCompositionStart === nextProps.onCompositionStart &&
        prevProps.onCompositionEnd === nextProps.onCompositionEnd &&
        prevProps.onBlur === nextProps.onBlur &&
        prevProps.onSendMessage === nextProps.onSendMessage
    );
}); 