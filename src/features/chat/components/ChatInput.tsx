import React, { useState, useRef, useEffect } from 'react';
import { ChatInputContainer, Input, SendButton } from '../styles/ChatRoom.styles';
import { SendIcon } from './icons';

interface ChatInputProps {
    onSendMessage: () => void;
    onTypingStatusChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isConnected: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onTypingStatusChange, isConnected }) => {
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isComposingRef = useRef(false);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleCompositionStart = () => {
        isComposingRef.current = true;
    };

    const handleCompositionEnd = () => {
        isComposingRef.current = false;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isComposingRef.current) {
            e.preventDefault();
            onSendMessage();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        onTypingStatusChange(e);
    };

    return (
        <ChatInputContainer>
            <Input
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
                disabled={!isConnected}
            />
            <SendButton 
                onClick={onSendMessage}
                disabled={!isConnected || !inputValue.trim()}
            >
                <SendIcon />
            </SendButton>
        </ChatInputContainer>
    );
};

export default ChatInput; 