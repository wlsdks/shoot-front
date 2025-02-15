// 개별 메시지 렌더링
import React from 'react';

export interface MessageContent {
    text: string;
    type: string;
    attachments: any[];
    isEdited: boolean;
    isDeleted: boolean;
}

export interface ChatMessageProps {
    senderId?: string;
    content: MessageContent;
    timestamp?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ senderId, content, timestamp }) => {
    return (
        <div style={{ marginBottom: '8px' }}>
        <div>
            <strong>{senderId}</strong> <small>{timestamp}</small>
        </div>
        <div>{content.text}</div>
        </div>
    );
};

export default ChatMessage;
