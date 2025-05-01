import React from 'react';
import { ChatMessageItem, MessageStatus } from '../types/ChatRoom.types';
import { MessageRow as StyledMessageRow, ChatBubble, TimeContainer, ReadIndicator } from '../styles/ChatRoom.styles';

interface MessageRowProps {
    message: ChatMessageItem;
    isOwn: boolean;
    showTime: boolean;
    currentTime: string;
    userId: number;
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
    userId,
    statusIndicator,
    indicatorText,
    onContextMenu,
    onClick
}) => {
    // Determine if the message has been read by others
    const shouldShowReadIndicator = () => {
        // indicatorText가 있으면 그것을 사용
        if (indicatorText) return true;
        
        // Only show read indicators for our own messages
        if (!isOwn) return false;
        
        // Only show for saved messages
        if (message.status !== MessageStatus.SAVED) return false;
        
        // Check if there are other participants
        const otherParticipants = Object.keys(message.readBy || {})
            .filter(id => id !== userId.toString());
        
        // If no other participants, don't show indicator
        if (otherParticipants.length === 0) return false;
        
        // Check if all other participants have read the message
        const allRead = otherParticipants.every(id => message.readBy[id] === true);
        
        // If at least one person hasn't read, show unread indicator
        return !allRead;
    };
    
    // Show indicator if needed
    const showUnreadIndicator = shouldShowReadIndicator();

    return (
        <StyledMessageRow id={`msg-${message.id}`} $isOwnMessage={isOwn}>
            {isOwn ? (
                <>
                    <TimeContainer $isOwnMessage={true}>
                        {statusIndicator}
                        {showUnreadIndicator && <ReadIndicator>{indicatorText || "1"}</ReadIndicator>}
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