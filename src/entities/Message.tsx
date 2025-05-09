import React from 'react';
import { MessageReaction } from '../features/MessageReaction';

interface MessageProps {
  id: string;
  content: string;
  senderId: number;
  timestamp: string;
  reactions: Record<string, number[]>;
  currentUserId: number;
  onReactionUpdate: (messageId: string, reactions: Record<string, number[]>) => void;
}

export const Message: React.FC<MessageProps> = ({
  id,
  content,
  senderId,
  timestamp,
  reactions,
  currentUserId,
  onReactionUpdate,
}) => {
  return (
    <div className="message">
      <div className="message-content">{content}</div>
      <div className="message-footer">
        <span className="message-time">{new Date(timestamp).toLocaleTimeString()}</span>
        <MessageReaction
          messageId={id}
          reactions={reactions}
          currentUserId={currentUserId}
          onReactionUpdate={(newReactions) => onReactionUpdate(id, newReactions)}
        />
      </div>
    </div>
  );
}; 