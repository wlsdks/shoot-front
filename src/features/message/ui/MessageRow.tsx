import React, { memo } from 'react';
import styled from 'styled-components';
import { ChatMessageItem, MessageStatus } from '../types/ChatRoom.types';
import { MessageRow as StyledMessageRow, ChatBubble, TimeContainer, ReadIndicator } from '../ui/styles/ChatRoom.styles';

const ReactionEmoji = styled.div<{ $isOwnMessage: boolean }>`
    position: absolute;
    right: -8px;
    top: -8px;
    font-size: 12px;
    z-index: 1;
    background: white;
    padding: 1px 4px;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 1px;
    min-width: 16px;
    min-height: 16px;
    align-items: center;
    justify-content: center;
    border: 1px solid #eee;
`;

const EmojiSpan = styled.span`
    display: inline-block;
    font-size: 12px;
    line-height: 1;
`;

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

const MessageRowComponent: React.FC<MessageRowProps> = ({
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

    const renderReactions = () => {
        if (!message.reactions || !Array.isArray(message.reactions)) {
            console.log('Message reactions is not an array:', message.reactions);
            return null;
        }
        
        // 현재 사용자의 반응 찾기
        const userReaction = message.reactions.find(reaction => {
            if (!reaction.userIds || !Array.isArray(reaction.userIds)) {
                console.log('userIds is not an array');
                return false;
            }
            
            // userId를 문자열로 변환하여 비교
            const userIdStr = userId.toString();
            const hasUser = reaction.userIds.some((id: string | number) => id.toString() === userIdStr);
            return hasUser;
        });

        if (!userReaction) return null;
        return <EmojiSpan>{userReaction.emoji}</EmojiSpan>;
    };

    const hasReactions = message.reactions && Array.isArray(message.reactions) && message.reactions.length > 0;

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
                        {hasReactions && (
                            <ReactionEmoji $isOwnMessage={isOwn}>
                                {renderReactions()}
                            </ReactionEmoji>
                        )}
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
                        {hasReactions && (
                            <ReactionEmoji $isOwnMessage={isOwn}>
                                {renderReactions()}
                            </ReactionEmoji>
                        )}
                    </ChatBubble>
                    <TimeContainer $isOwnMessage={false}>
                        {showTime && <div>{currentTime}</div>}
                    </TimeContainer>
                </>
            )}
        </StyledMessageRow>
    );
};

// React.memo로 렌더링 최적화 - 메시지별 개별 메모이제이션
export const MessageRow = memo(MessageRowComponent, (prevProps, nextProps) => {
    // 메시지 내용, 상태, 시간 표시 여부 등이 동일하면 리렌더링 하지 않음
    return (
        prevProps.message === nextProps.message &&
        prevProps.isOwn === nextProps.isOwn &&
        prevProps.showTime === nextProps.showTime &&
        prevProps.currentTime === nextProps.currentTime &&
        prevProps.userId === nextProps.userId &&
        prevProps.statusIndicator === nextProps.statusIndicator &&
        prevProps.indicatorText === nextProps.indicatorText &&
        prevProps.onContextMenu === nextProps.onContextMenu &&
        prevProps.onClick === nextProps.onClick
    );
});