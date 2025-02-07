// 메시지 리스트
import React from 'react';
import ChatMessage from './ChatMessage';

export interface ChatMessageItem {
  senderId: string;
  content: string;
  timestamp?: string;
}

interface ChatMessageListProps {
  messages: ChatMessageItem[];
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages }) => {
  return (
    <div>
      {messages.map((msg, index) => (
        <ChatMessage
          key={index}
          senderId={msg.senderId}
          content={msg.content}
          timestamp={msg.timestamp}
        />
      ))}
    </div>
  );
};

export default ChatMessageList;