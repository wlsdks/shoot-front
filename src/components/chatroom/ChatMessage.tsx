// 개별 메시지 렌더링
import React from 'react';

interface ChatMessageProps {
  senderId: string;
  content: string;
  timestamp?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ senderId, content, timestamp }) => {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div>
        <strong>{senderId}</strong> <small>{timestamp}</small>
      </div>
      <div>{content}</div>
    </div>
  );
};

export default ChatMessage;