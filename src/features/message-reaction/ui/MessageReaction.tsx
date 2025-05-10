import React from 'react';
import { useMessageReaction } from '../model/useMessageReaction';
import { MessageReactionProps } from '../types';

export const MessageReaction: React.FC<MessageReactionProps> = (props) => {
    const { reactions, reactionTypes, handleReaction, isLoading } = useMessageReaction(props);

    if (isLoading) {
        return <div className="message-reaction-loading">로딩 중...</div>;
    }

    return (
        <div className="message-reaction">
        {reactionTypes.map((type) => (
            <button
            key={type.code}
            onClick={() => handleReaction(type.code)}
            className={`reaction-button ${reactions[type.code]?.includes(props.userId || 0) ? 'active' : ''}`}
            >
            {type.emoji}
            <span className="reaction-count">{reactions[type.code]?.length || 0}</span>
            </button>
        ))}
        </div>
    );
}; 