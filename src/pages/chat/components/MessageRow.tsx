import React from 'react';
import { ChatMessageItem } from '../types/ChatRoom.types';
import { MessageRow as StyledMessageRow, ChatBubble, TimeContainer } from '../styles/ChatRoom.styles';
import { formatTime } from '../utils/timeUtils';

interface MessageRowProps {
    message: ChatMessageItem;
    isOwn: boolean;
    showTime: boolean;
    currentTime: string;
    statusIndicator?: JSX.Element | null;
    indicatorText?: string;
    onContextMenu: (e: React.MouseEvent, message: ChatMessageItem) => void;
    onClick: (e: React.MouseEvent, message: ChatMessageItem) => void;
}

export const MessageRow: React.FC<MessageRowProps> = ({
    message,
    isOwn,
    showTime,
    currentTime,
    statusIndicator,
    indicatorText,
    onContextMenu,
    onClick
}) => {
    return (
        <StyledMessageRow id={`msg-${message.id}`} $isOwnMessage={isOwn}>
            {isOwn ? (
                <>
                    <TimeContainer $isOwnMessage={true}>
                        {statusIndicator}
                        {indicatorText && <div>{indicatorText}</div>}
                        {showTime && <div>{currentTime}</div>}
                    </TimeContainer>
                    <ChatBubble 
                        $isOwnMessage={isOwn} 
                        onContextMenu={(e) => onContextMenu(e, message)}
                        onClick={(e) => onClick(e, message)}
                    >
                        <div>{message.content?.text || '메시지를 불러올 수 없습니다'}</div>
                    </ChatBubble>
                </>
            ) : (
                <>
                    <ChatBubble 
                        $isOwnMessage={isOwn} 
                        onContextMenu={(e) => onContextMenu(e, message)}
                        onClick={(e) => onClick(e, message)}
                    >
                        <div>{message.content?.text || '메시지를 불러올 수 없습니다'}</div>
                    </ChatBubble>
                    <TimeContainer $isOwnMessage={false}>
                        {showTime && <div>{currentTime}</div>}
                    </TimeContainer>
                </>
            )}
        </StyledMessageRow>
    );
}; 