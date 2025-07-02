import React from 'react';

interface MessageProps {
    content: string;
    author: string;
    timestamp: string;
    renderReaction?: () => React.ReactNode;
}

export const Message: React.FC<MessageProps> = ({ 
    content, 
    author, 
    timestamp, 
    renderReaction 
}) => {
    return (
        <div className="message">
            <div className="message-header">
                <span className="author">{author}</span>
                <span className="timestamp">{timestamp}</span>
            </div>
            <div className="message-content">{content}</div>
            {renderReaction && (
                <div className="message-reactions">
                    {renderReaction()}
                </div>
            )}
        </div>
    );
}; 